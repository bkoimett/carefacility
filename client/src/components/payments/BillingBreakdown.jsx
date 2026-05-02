import { formatKES, formatDate } from '../../utils/formatters'

const TYPE_COLORS = {
  monthly_fee: 'bg-primary/10 text-primary border-primary/20',
  medical_fee: 'bg-secondary/10 text-secondary border-secondary/20',
  daily_charge: 'bg-error/10 text-error border-error/20',
  deposit: 'bg-success/10 text-success border-success/20',
}

const TYPE_ICONS = {
  monthly_fee: '📅',
  medical_fee: '🏥',
  daily_charge: '⏳',
  deposit: '💰',
}

export default function BillingBreakdown({ billing }) {
  if (!billing) return null

  const { breakdown = [], totalCharged, totalPaid, balance, phase, daysPostExpiry, dailyRate, expiryDate } = billing

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#070D19] rounded-xl p-3 text-center">
          <p className="text-xs text-[#F0F4FF]/50 uppercase tracking-wider mb-1">Total Charged</p>
          <p className="font-mono font-semibold text-[#F0F4FF]">{formatKES(totalCharged)}</p>
        </div>
        <div className="bg-[#070D19] rounded-xl p-3 text-center">
          <p className="text-xs text-[#F0F4FF]/50 uppercase tracking-wider mb-1">Total Paid</p>
          <p className="font-mono font-semibold text-success">{formatKES(totalPaid)}</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${balance < 0 ? 'bg-error/10' : balance > 0 ? 'bg-success/10' : 'bg-[#070D19]'}`}>
          <p className="text-xs text-[#F0F4FF]/50 uppercase tracking-wider mb-1">
            {balance < 0 ? 'Amount Owed' : balance > 0 ? 'Credit' : 'Balance'}
          </p>
          <p className={`font-mono font-semibold ${balance < 0 ? 'text-error' : balance > 0 ? 'text-success' : 'text-[#F0F4FF]'}`}>
            {balance === 0 ? 'Settled ✓' : `${balance < 0 ? '−' : '+'}${formatKES(Math.abs(balance))}`}
          </p>
        </div>
      </div>

      {/* Phase badge */}
      {phase === 'post_expiry' && (
        <div className="alert alert-error py-2.5 text-sm">
          <span>🚨</span>
          <span>
            <strong>Post-Expiry:</strong> Agreed duration expired.
            {daysPostExpiry > 0 && ` ${daysPostExpiry} day(s) of daily charges at ${formatKES(dailyRate)}/day accumulating.`}
            {expiryDate && ` Expiry: ${formatDate(expiryDate)}`}
          </span>
        </div>
      )}

      {/* Charge breakdown timeline */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F0F4FF]/40 mb-3">
          Charge Schedule
        </h4>
        <div className="space-y-2">
          {breakdown.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl border text-sm
                ${TYPE_COLORS[item.type] || 'bg-[#070D19] text-[#F0F4FF] border-base-300'}
              `}
            >
              <div className="flex items-center gap-2">
                <span>{TYPE_ICONS[item.type] || '📋'}</span>
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs opacity-60 font-mono">Due: {formatDate(item.dueDate)}</p>
                </div>
              </div>
              <span className="font-mono font-semibold">{formatKES(item.amount)}</span>
            </div>
          ))}
          {breakdown.length === 0 && (
            <p className="text-sm text-[#F0F4FF]/30 text-center py-4">
              No charges computed yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
