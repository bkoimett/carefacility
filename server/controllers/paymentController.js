const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Sponsor = require('../models/Sponsor');
const { generateReceipt } = require('../utils/receiptGenerator');
const { computeBillingState } = require('../utils/billingEngine');

// GET /api/payments?clientId=xxx
exports.getPayments = async (req, res) => {
  try {
    const { clientId, page = 1, limit = 50 } = req.query;
    const filter = clientId ? { client: clientId } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('client', 'name status')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: payments,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments
exports.createPayment = async (req, res) => {
  console.log('CREATE PAYMENT HIT:', req.body);
  try {
    const { clientId, amount, paymentDate, paymentMethod, reference, paidBy, paymentType, notes, billingPeriodLabel } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const payment = await Payment.create({
      client: clientId,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      reference,
      paidBy,
      paymentType,
      notes,
      billingPeriodLabel
    });

    // Return updated billing state
    const allPayments = await Payment.find({ client: clientId });
    const billing = computeBillingState(client.toObject(), allPayments);

    res.status(201).json({
      success: true,
      data: payment,
      updatedBilling: {
        totalCharged: billing.totalCharged,
        totalPaid: billing.totalPaid,
        balance: billing.balance
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/payments/:id
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/monthly-summary
exports.getPaymentsMonthlySummary = async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      {
        $group: {
          _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          payments: {
            $push: {
              _id: '$_id',
              amount: '$amount',
              paymentDate: '$paymentDate',
              paymentMethod: '$paymentMethod',
              paidBy: '$paidBy',
              paymentType: '$paymentType',
              reference: '$reference',
              client: '$client'
            }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Populate client names for each payment
    const populatedPayments = await Promise.all(payments.map(async (m) => {
      const populated = await Payment.populate(m.payments, { path: 'client', select: 'name' });
      return {
        ...m,
        payments: populated
      };
    }));

    res.json(populatedPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/payments/:id
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/:id/receipt
exports.getReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('client');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
        error: { code: 'PAYMENT_NOT_FOUND' },
        data: null
      });
    }

    const client = payment.client;

    let sponsor = null;
    const sponsorRef = client?.sponsor;
    if (sponsorRef) {
      sponsor = await Sponsor.findById(sponsorRef);
    }

    const pdfBuffer = await generateReceipt(payment, client, sponsor);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="receipt-${payment._id}.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
