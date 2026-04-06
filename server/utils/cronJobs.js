const Client = require('../models/Client');
const Payment = require('../models/Payment');
const Alert = require('../models/Alert');
const { getAlertsForClient } = require('./billingEngine');

async function runDailyAlertJob() {
  try {
    const activeClients = await Client.find({ status: 'active' });
    let created = 0;
    let skipped = 0;

    for (const client of activeClients) {
      const payments = await Payment.find({ client: client._id });
      const alerts = getAlertsForClient(client, payments);

      for (const alertData of alerts) {
        try {
          await Alert.findOneAndUpdate(
            {
              client: client._id,
              alertType: alertData.alertType,
              periodKey: alertData.periodKey
            },
            {
              $setOnInsert: {
                client: client._id,
                alertType: alertData.alertType,
                message: alertData.message,
                severity: alertData.severity,
                periodKey: alertData.periodKey,
                amountDue: alertData.amountDue || 0,
                daysPostExpiry: alertData.daysPostExpiry || 0,
                isRead: false,
                isDismissed: false
              }
            },
            { upsert: true, new: true }
          );
          created++;
        } catch (dupErr) {
          // Duplicate key = alert already exists, skip
          skipped++;
        }
      }
    }

    console.log(`✅ Alert job complete: ${created} created, ${skipped} skipped`);
  } catch (err) {
    console.error('❌ Alert job error:', err);
  }
}

module.exports = { runDailyAlertJob };
