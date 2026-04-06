const {
  differenceInDays,
  differenceInCalendarMonths,
  addMonths,
  addDays,
  isBefore,
  isAfter,
  startOfDay,
  format
} = require('date-fns');

const DAILY_RATE = parseInt(process.env.DAILY_RATE_AFTER_EXPIRY || '1500');

/**
 * Parse special comment directives from client.comments
 */
function parseCommentDirectives(comments = '') {
  const directives = {
    ignoreExpiry: false,
    manualBilling: false,
    resetBilling: null // { monthly, medical }
  };

  if (!comments) return directives;

  if (comments.includes('IGNORE_ALERT:EXPIRY')) {
    directives.ignoreExpiry = true;
  }
  if (comments.includes('MANUAL_BILLING:true')) {
    directives.manualBilling = true;
  }

  const resetMatch = comments.match(/RESET_BILLING:(?:new_monthly|monthly)=(\d+),(?:new_medical|medical)=(\d+)/);
  if (resetMatch) {
    directives.resetBilling = {
      monthly: parseInt(resetMatch[1]),
      medical: parseInt(resetMatch[2])
    };
  }

  return directives;
}

/**
 * Compute the full billing state for a client
 * Returns: { totalCharged, totalPaid, balance, breakdown[], phase, daysPostExpiry, expiryDate }
 */
function computeBillingState(client, payments = []) {
  const today = startOfDay(new Date());
  const admission = startOfDay(new Date(client.dateOfAdmission));
  const discharge = client.dateOfDischarge ? startOfDay(new Date(client.dateOfDischarge)) : null;
  const endDate = discharge || today;

  const daysElapsed = differenceInDays(endDate, admission);

  const directives = parseCommentDirectives(client.comments);

  // Determine effective fees (reset billing takes precedence)
  let effectiveMonthlyFee = client.monthlyFee;
  let effectiveMedicalFee = client.medicalFee;
  let billingStartDate = admission;

  if (client.billingResetAt) {
    billingStartDate = startOfDay(new Date(client.billingResetAt));
    effectiveMonthlyFee = client.resetMonthlyFee || client.monthlyFee;
    effectiveMedicalFee = client.resetMedicalFee || client.medicalFee;
  } else if (directives.resetBilling) {
    effectiveMonthlyFee = directives.resetBilling.monthly;
    effectiveMedicalFee = directives.resetBilling.medical;
  }

  const dailyRate = client.customDailyRate || DAILY_RATE;
  const agreedDays = client.agreedDurationMonths * 30;
  const expiryDate = addDays(admission, agreedDays);

  const breakdown = [];
  let totalCharged = 0;

  // ── Month 1 ──────────────────────────────────────────────────────────
  // Deposit (already paid upfront – recorded separately in payments)
  // Charge: deposit + remaining monthlyFee + full medicalFee
  const month1Due = addDays(admission, 30);
  const month1Total = effectiveMonthlyFee + effectiveMedicalFee;

  breakdown.push({
    label: 'Month 1 – Monthly + Medical Fee',
    amount: month1Total,
    dueDate: month1Due,
    type: 'monthly_fee',
    periodKey: 'M1'
  });
  totalCharged += month1Total;

  // ── Months 2 → agreedDurationMonths ─────────────────────────────────
  for (let m = 2; m <= client.agreedDurationMonths; m++) {
    const dueDate = addDays(admission, m * 30);
    if (isBefore(dueDate, addDays(endDate, 1))) {
      breakdown.push({
        label: `Month ${m} – Monthly Fee`,
        amount: effectiveMonthlyFee,
        dueDate,
        type: 'monthly_fee',
        periodKey: `M${m}`
      });
      totalCharged += effectiveMonthlyFee;
    }
  }

  // ── Post-expiry daily charges ────────────────────────────────────────
  let daysPostExpiry = 0;
  let phase = 'within_duration';

  if (isAfter(endDate, expiryDate) || endDate.getTime() === expiryDate.getTime()) {
    phase = 'post_expiry';
    const postExpiryEndDate = discharge || today;
    daysPostExpiry = Math.max(0, differenceInDays(postExpiryEndDate, expiryDate));

    if (daysPostExpiry > 0 && !directives.ignoreExpiry && !directives.manualBilling) {
      const dailyTotal = daysPostExpiry * dailyRate;
      breakdown.push({
        label: `Post-Expiry Daily Charges (${daysPostExpiry} days × KES ${dailyRate.toLocaleString()})`,
        amount: dailyTotal,
        dueDate: postExpiryEndDate,
        type: 'daily_charge',
        periodKey: `DAILY_${format(expiryDate, 'yyyyMMdd')}`
      });
      totalCharged += dailyTotal;
    }
  }

  // ── Totals ───────────────────────────────────────────────────────────
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalPaid - totalCharged; // positive = credit, negative = owes

  return {
    totalCharged,
    totalPaid,
    balance,
    breakdown,
    phase,
    daysPostExpiry,
    expiryDate,
    dailyRate,
    effectiveMonthlyFee,
    effectiveMedicalFee,
    daysElapsed,
    directives
  };
}

/**
 * Determine which alerts should fire today for a client
 */
function getAlertsForClient(client, payments = []) {
  const today = startOfDay(new Date());
  const admission = startOfDay(new Date(client.dateOfAdmission));
  const daysElapsed = differenceInDays(today, admission);
  const directives = parseCommentDirectives(client.comments);

  // No alerts for discharged or absconded clients
  if (client.status === 'discharged' || client.status === 'absconded') return [];

  const billing = computeBillingState(client, payments);
  const alerts = [];

  const firstMonthTotal = billing.effectiveMonthlyFee + billing.effectiveMedicalFee;
  const totalPaid = billing.totalPaid;

  // FIRST_MONTH_DUE – 25 days after admission, first month not fully paid
  if (daysElapsed >= 25 && daysElapsed <= 35 && totalPaid < firstMonthTotal) {
    const remaining = firstMonthTotal - totalPaid;
    alerts.push({
      alertType: 'FIRST_MONTH_DUE',
      message: `First month payment due in ${30 - daysElapsed} days. Outstanding: KES ${remaining.toLocaleString()}`,
      severity: 'warning',
      periodKey: `FIRST_MONTH_${format(admission, 'yyyyMM')}`,
      amountDue: remaining
    });
  }

  // SPONSOR_REMINDER – exactly 30 days after admission
  if (daysElapsed >= 30 && daysElapsed <= 32) {
    alerts.push({
      alertType: 'SPONSOR_REMINDER',
      message: `Remind sponsor: Only monthly fee (KES ${billing.effectiveMonthlyFee.toLocaleString()}) going forward – no more medical fee.`,
      severity: 'info',
      periodKey: `SPONSOR_30_${format(admission, 'yyyyMM')}`,
      amountDue: billing.effectiveMonthlyFee
    });
  }

  // MONTHLY_FEE_DUE – 5 days after each 30-day mark within agreed duration
  for (let m = 2; m <= client.agreedDurationMonths; m++) {
    const dueDay = m * 30;
    if (daysElapsed >= dueDay + 5 && daysElapsed <= dueDay + 10) {
      const monthCharged = billing.breakdown
        .filter(b => b.periodKey === `M${m}`)
        .reduce((s, b) => s + b.amount, 0);

      // Rough check: if paid doesn't seem to cover this month
      alerts.push({
        alertType: 'MONTHLY_FEE_DUE',
        message: `Month ${m} fee overdue. KES ${billing.effectiveMonthlyFee.toLocaleString()} past due.`,
        severity: 'warning',
        periodKey: `MONTHLY_M${m}_${format(admission, 'yyyy')}`,
        amountDue: billing.effectiveMonthlyFee
      });
    }
  }

  // EXPIRY_WARNING – at 2.5 months if 3-month duration, or 75% of any duration
  const warningDays = Math.floor(client.agreedDurationMonths * 30 * 0.833);
  if (daysElapsed >= warningDays && daysElapsed < client.agreedDurationMonths * 30 && !directives.ignoreExpiry) {
    const expiryDate = addDays(admission, client.agreedDurationMonths * 30);
    const daysLeft = differenceInDays(expiryDate, today);
    alerts.push({
      alertType: 'EXPIRY_WARNING',
      message: `Agreed duration expires in ${daysLeft} day(s). Daily charges of KES ${billing.dailyRate.toLocaleString()}/day begin after expiry.`,
      severity: 'warning',
      periodKey: `EXPIRY_WARN_${format(admission, 'yyyyMM')}`,
      amountDue: 0
    });
  }

  // EXPIRY_OVERDUE – 1 day after agreed duration ends
  if (billing.phase === 'post_expiry' && billing.daysPostExpiry >= 1 && !directives.ignoreExpiry) {
    const dailyTotal = billing.daysPostExpiry * billing.dailyRate;
    alerts.push({
      alertType: 'EXPIRY_OVERDUE',
      message: `Agreed duration expired ${billing.daysPostExpiry} day(s) ago. Daily charges accumulating: KES ${dailyTotal.toLocaleString()} owed.`,
      severity: 'critical',
      periodKey: `EXPIRY_OVER_${format(today, 'yyyyMMdd')}`,
      amountDue: dailyTotal,
      daysPostExpiry: billing.daysPostExpiry
    });
  }

  // DAILY_CHARGE_ALERT – every 7 days while in post-expiry
  if (billing.phase === 'post_expiry' && billing.daysPostExpiry > 0 && billing.daysPostExpiry % 7 === 0) {
    alerts.push({
      alertType: 'DAILY_CHARGE_ALERT',
      message: `Weekly post-expiry charge update: ${billing.daysPostExpiry} days at KES ${billing.dailyRate.toLocaleString()}/day = KES ${(billing.daysPostExpiry * billing.dailyRate).toLocaleString()}`,
      severity: 'critical',
      periodKey: `DAILY_WEEKLY_${format(today, 'yyyyMMdd')}`,
      amountDue: billing.daysPostExpiry * billing.dailyRate,
      daysPostExpiry: billing.daysPostExpiry
    });
  }

  return alerts;
}

module.exports = {
  computeBillingState,
  getAlertsForClient,
  parseCommentDirectives,
  DAILY_RATE
};
