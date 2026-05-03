const Sponsor = require('../models/Sponsor');
const Client = require('../models/Client');

exports.getAllSponsors = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];

    const sponsors = await Sponsor.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: 'sponsor',
          as: 'clients'
        }
      },
      {
        $lookup: {
          from: 'payments',
          let: { sponsorClients: '$clients._id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$client', '$$sponsorClients'] }
              }
            }
          ],
          as: 'payments'
        }
      },
      {
        $addFields: {
          clientCount: { $size: '$clients' },
          activeClientsCount: {
            $size: {
              $filter: {
                input: '$clients',
                as: 'c',
                cond: { $eq: ['$$c.status', 'active'] }
              }
            }
          },
          totalPaid: { $sum: '$payments.amount' }
        }
      },
      {
        $project: {
          clients: 0,
          payments: 0
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({ success: true, data: sponsors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ success: false, message: 'Sponsor not found' });

    const clients = await Client.find({ sponsor: sponsor._id })
      .select('name status dateOfAdmission monthlyFee medicalFee agreedDurationMonths');

    res.json({ success: true, data: { ...sponsor.toObject(), clients } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.create(req.body);
    res.status(201).json({ success: true, data: sponsor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sponsor) return res.status(404).json({ success: false, message: 'Sponsor not found' });
    res.json({ success: true, data: sponsor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndDelete(req.params.id);
    if (!sponsor) return res.status(404).json({ success: false, message: 'Sponsor not found' });

    // Unlink clients
    await Client.updateMany({ sponsor: req.params.id }, { $unset: { sponsor: '' } });

    res.json({ success: true, message: 'Sponsor deleted and clients unlinked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
