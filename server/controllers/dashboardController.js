const Client = require('../models/Client');
const Payment = require('../models/Payment');
const Alert = require('../models/Alert');
const Sponsor = require('../models/Sponsor');
const { computeBillingState } = require('../utils/billingEngine');
const { startOfMonth, endOfMonth, startOfDay } = require('date-fns');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = startOfDay(new Date());

    // Client counts by status
    const [totalActive, totalDischarged, totalAbsconded] = await Promise.all([
      Client.countDocuments({ status: 'active' }),
      Client.countDocuments({ status: 'discharged' }),
      Client.countDocuments({ status: 'absconded' })
    ]);

    // Unread alerts by severity
    const alertCounts = await Alert.aggregate([
      { $match: { isDismissed: false, isRead: false } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const alertStats = { info: 0, warning: 0, critical: 0 };
    alertCounts.forEach(a => { alertStats[a._id] = a.count; });

    // Revenue this month
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthlyPayments = await Payment.aggregate([
      { $match: { paymentDate: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenueThisMonth = monthlyPayments[0]?.total || 0;

    // Total revenue all time
    const totalRevenueAgg = await Payment.aggregate([
      { $match: { amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Outstanding balances across all active clients
    const activeClients = await Client.find({ status: 'active' });
    let totalOutstanding = 0;
    let postExpiryCount = 0;
    const overdueClients = [];

    for (const client of activeClients) {
      const payments = await Payment.find({ client: client._id });
      const billing = computeBillingState(client.toObject(), payments);

      if (billing.balance < 0) {
        totalOutstanding += Math.abs(billing.balance);
        overdueClients.push({
          _id: client._id,
          name: client.name,
          balance: billing.balance,
          phase: billing.phase,
          daysPostExpiry: billing.daysPostExpiry
        });
      }

      if (billing.phase === 'post_expiry') postExpiryCount++;
    }

    // Sort overdue by worst balance
    overdueClients.sort((a, b) => a.balance - b.balance);

    // Recent payments (last 10)
    const recentPayments = await Payment.find()
      .populate('client', 'name')
      .sort({ paymentDate: -1 })
      .limit(10);

    // Monthly revenue trend (last 6 months)
    const revenueTrend = await Payment.aggregate([
      {
        $match: {
          amount: { $gt: 0 },
          paymentDate: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        clients: {
          active: totalActive,
          discharged: totalDischarged,
          absconded: totalAbsconded,
          total: totalActive + totalDischarged + totalAbsconded,
          postExpiry: postExpiryCount
        },
        alerts: alertStats,
        revenue: {
          thisMonth: revenueThisMonth,
          total: totalRevenue
        },
        outstanding: {
          total: totalOutstanding,
          clients: overdueClients.slice(0, 5)
        },
        recentPayments,
        revenueTrend
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
