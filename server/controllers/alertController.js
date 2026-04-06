const Alert = require('../models/Alert');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const { runDailyAlertJob } = require('../utils/cronJobs');

exports.getAlerts = async (req, res) => {
  try {
    const { clientId, isRead, isDismissed, severity, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (clientId) filter.client = clientId;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (isDismissed !== undefined) filter.isDismissed = isDismissed === 'true';
    else filter.isDismissed = false; // default: hide dismissed
    if (severity) filter.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Alert.countDocuments(filter);
    const alerts = await Alert.find(filter)
      .populate('client', 'name status dateOfAdmission sponsor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const unreadCount = await Alert.countDocuments({ isDismissed: false, isRead: false });

    res.json({
      success: true,
      data: alerts,
      unreadCount,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.dismissAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isDismissed: true, isRead: true }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Alert.updateMany({ isRead: false, isDismissed: false }, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.triggerJob = async (req, res) => {
  try {
    await runDailyAlertJob();
    res.json({ success: true, message: 'Alert job triggered manually' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
