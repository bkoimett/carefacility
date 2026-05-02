const Client = require('../models/Client');
const Payment = require('../models/Payment');
const Alert = require('../models/Alert');
const { computeBillingState, parseCommentDirectives } = require('../utils/billingEngine');
const { startOfDay } = require('date-fns');

// GET /api/clients
exports.getAllClients = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Client.countDocuments(filter);
    const clients = await Client.find(filter)
      .populate('sponsor', 'name phone email relationship')
      .sort({ dateOfAdmission: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Attach billing summary to each client
    const enriched = await Promise.all(clients.map(async (c) => {
      const payments = await Payment.find({ client: c._id });
      const billing = computeBillingState(c.toObject(), payments);
      return {
        ...c.toObject(),
        billing: {
          totalCharged: billing.totalCharged,
          totalPaid: billing.totalPaid,
          balance: billing.balance,
          phase: billing.phase,
          daysPostExpiry: billing.daysPostExpiry,
          expiryDate: billing.expiryDate
        }
      };
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/clients/:id
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('sponsor', 'name phone email relationship address notes');

    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const payments = await Payment.find({ client: client._id }).sort({ paymentDate: -1 });
    const alerts = await Alert.find({ client: client._id, isDismissed: false }).sort({ createdAt: -1 });
    const billing = computeBillingState(client.toObject(), payments);

    res.json({
      success: true,
      data: {
        ...client.toObject(),
        billing,
        payments,
        alerts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/clients
exports.createClient = async (req, res) => {
  try {
    const clientData = req.body;

    // Parse RESET_BILLING directive from comments if present
    const directives = parseCommentDirectives(clientData.comments);
    if (directives.resetBilling) {
      clientData.billingResetAt = new Date();
      clientData.resetMonthlyFee = directives.resetBilling.monthly;
      clientData.resetMedicalFee = directives.resetBilling.medical;
    }

    const client = await Client.create(clientData);

    // Record deposit as first payment if provided
    if (clientData.depositAmount && clientData.depositAmount > 0) {
      await Payment.create({
        client: client._id,
        amount: clientData.depositAmount,
        paymentDate: client.dateOfAdmission,
        paymentType: 'deposit',
        paidBy: clientData.depositPaidBy || '',
        billingPeriodLabel: 'Admission Deposit',
        notes: 'Initial deposit on admission'
      });
    }

    res.status(201).json({ success: true, data: client });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/clients/:id
exports.updateClient = async (req, res) => {
  try {
    const updates = req.body;

    // Re-parse comments for RESET_BILLING
    if (updates.comments) {
      const directives = parseCommentDirectives(updates.comments);
      if (directives.resetBilling) {
        updates.billingResetAt = new Date();
        updates.resetMonthlyFee = directives.resetBilling.monthly;
        updates.resetMedicalFee = directives.resetBilling.medical;
      }
    }

    // Handle status change to discharged
    if (updates.status === 'discharged' && !updates.dateOfDischarge) {
      updates.dateOfDischarge = new Date();
    }

    const client = await Client.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('sponsor', 'name phone email');

    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    // Cascade delete payments and alerts
    await Payment.deleteMany({ client: req.params.id });
    await Alert.deleteMany({ client: req.params.id });

    res.json({ success: true, message: 'Client and all associated records deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/clients/:id/billing
exports.getClientBilling = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('sponsor', 'name phone');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const payments = await Payment.find({ client: client._id }).sort({ paymentDate: 1 });
    const billing = computeBillingState(client.toObject(), payments);

    res.json({ success: true, data: { client, billing, payments } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/clients/filter/:status
exports.getClientsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const filter = status === 'all' ? {} : { status };

    const activeCount = await Client.countDocuments({ status: 'active' });
    const dischargedCount = await Client.countDocuments({ status: 'discharged' });
    const totalCount = await Client.countDocuments();

    const clients = await Client.find(filter)
      .populate('sponsor', 'name phone email relationship');

    const enriched = await Promise.all(clients.map(async (c) => {
      const payments = await Payment.find({ client: c._id });
      const billing = computeBillingState(c.toObject(), payments);
      return {
        ...c.toObject(),
        billing: {
          totalCharged: billing.totalCharged,
          totalPaid: billing.totalPaid,
          balance: billing.balance,
          phase: billing.phase,
          daysPostExpiry: billing.daysPostExpiry,
          expiryDate: billing.expiryDate
        }
      };
    }));

    res.json({
      clients: enriched,
      counts: { active: activeCount, discharged: dischargedCount, all: totalCount }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
