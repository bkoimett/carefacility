// Load environment variables - works from any directory
const path = require('path');
const dotenv = require('dotenv');

// Force load .env from the server directory
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('📁 Server directory:', __dirname);
console.log('🔍 .env path:', envPath);
console.log('🔍 MONGO_URI exists?', process.env.MONGO_URI ? 'YES' : 'NO');

if (!process.env.MONGO_URI) {
  console.error('❌ CRITICAL: MONGO_URI not found!');
  console.error('❌ Please create .env file at:', envPath);
  process.exit(1);
}

const mongoose = require('mongoose');
const Client = require('./models/Client');
const Sponsor = require('./models/Sponsor');
const Payment = require('./models/Payment');
const Alert = require('./models/Alert');

const seedDatabase = async () => {
  try {
    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully!\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Client.deleteMany({});
    await Sponsor.deleteMany({});
    await Payment.deleteMany({});
    await Alert.deleteMany({});
    console.log('✅ Cleared\n');

    // Create sponsors
    console.log('📝 Creating sponsors...');
    const sponsors = await Sponsor.insertMany([
      { name: 'Beatrice Kinyua', contactPhone: '+254 722 227341', contactEmail: 'beatrice@example.com', notes: 'Primary contact' },
      { name: 'Benta Atieno', contactPhone: '+254 701 474252', contactEmail: 'benta@example.com', notes: '' },
      { name: 'Teresa Wanjeri', contactPhone: '+254 722 239093', contactEmail: 'teresa@example.com', notes: 'Prefers WhatsApp' },
      { name: 'RoseAnne Wanguku', contactPhone: '+254 722 316251', contactEmail: 'roseanne@example.com', notes: '' },
      { name: 'Susan Mwakio', contactPhone: '+254 722 579286', contactEmail: 'susan@example.com', notes: '' },
      { name: 'Lydia Cherop', contactPhone: '+254 713 750661', contactEmail: 'lydia@example.com', notes: '' },
      { name: 'Naomi Mumbi', contactPhone: '+254 722 848316', contactEmail: 'naomi@example.com', notes: '' },
      { name: 'Abdi Ahmed', contactPhone: '+254 723 006868', contactEmail: 'abdi@example.com', notes: '' },
      { name: 'Jacinta Njeri', contactPhone: '+254 712 848995', contactEmail: 'jacinta@example.com', notes: 'Absconded case' },
      { name: 'Catherine Ngonyoko', contactPhone: '+254 721 518042', contactEmail: 'catherine@example.com', notes: '' },
    ]);
    console.log(`✅ Created ${sponsors.length} sponsors\n`);

    // Create clients
    console.log('👥 Creating clients...');
    const clients = await Client.insertMany([
      {
        name: 'Patrick Waruiru',
        gender: 'male',
        dateOfAdmission: new Date('2025-02-13'),
        agreedDurationMonths: 3,
        monthlyFee: 55000,
        medicalFee: 0,
        status: 'discharged',
        sponsor: sponsors[0]._id,
        comments: 'DISCHARGED - Completed full term',
      },
      {
        name: 'George Okello',
        gender: 'male',
        dateOfAdmission: new Date('2025-07-28'),
        agreedDurationMonths: 3,
        monthlyFee: 60000,
        medicalFee: 35000,
        status: 'active',
        sponsor: sponsors[1]._id,
        comments: 'Regular follow-up needed',
      },
      {
        name: 'Jeff Kaara',
        gender: 'male',
        dateOfAdmission: new Date('2025-09-24'),
        agreedDurationMonths: 3,
        monthlyFee: 50000,
        medicalFee: 15000,
        status: 'active',
        sponsor: sponsors[3]._id,
        comments: 'Shifta case - Special handling',
      },
      {
        name: 'Mark Nderitu',
        gender: 'male',
        dateOfAdmission: new Date('2025-12-05'),
        agreedDurationMonths: 3,
        monthlyFee: 40000,
        medicalFee: 30000,
        status: 'active',
        sponsor: sponsors[4]._id,
        comments: 'RESET_BILLING:monthly=40000,medical=30000',
      },
      {
        name: 'Peter Macharia',
        gender: 'male',
        dateOfAdmission: new Date('2026-01-10'),
        agreedDurationMonths: 3,
        monthlyFee: 60000,
        medicalFee: 35000,
        status: 'active',
        sponsor: sponsors[0]._id,
        comments: 'Post-expiry daily charges started',
      },
      {
        name: 'Rose Nyaguthii',
        gender: 'female',
        dateOfAdmission: new Date('2026-02-11'),
        agreedDurationMonths: 6,
        monthlyFee: 45000,
        medicalFee: 25000,
        status: 'active',
        sponsor: sponsors[1]._id,
        comments: 'Long term care',
      },
    ]);
    console.log(`✅ Created ${clients.length} clients\n`);

    // Create payments
    console.log('💰 Creating payments...');
    const payments = await Payment.insertMany([
      { 
        client: clients[0]._id, 
        amount: 55000, 
        paymentDate: new Date('2025-11-19'), 
        paymentType: 'monthly_fee', 
        billingPeriodLabel: 'Month 1',
        paymentMethod: 'cash',
        paidBy: 'Beatrice Kinyua',
        notes: 'First month payment'
      },
      { 
        client: clients[0]._id, 
        amount: 55000, 
        paymentDate: new Date('2025-12-16'), 
        paymentType: 'monthly_fee', 
        billingPeriodLabel: 'Month 2',
        paymentMethod: 'cash',
        paidBy: 'Beatrice Kinyua',
        notes: 'Second month payment'
      },
      { 
        client: clients[2]._id, 
        amount: 50000, 
        paymentDate: new Date('2025-09-25'), 
        paymentType: 'deposit', 
        billingPeriodLabel: 'Initial deposit',
        paymentMethod: 'mpesa',
        paidBy: 'RoseAnne Wanguku',
        notes: 'Deposit'
      },
      { 
        client: clients[2]._id, 
        amount: 50000, 
        paymentDate: new Date('2025-11-01'), 
        paymentType: 'monthly_fee', 
        billingPeriodLabel: 'Month 2',
        paymentMethod: 'mpesa',
        paidBy: 'RoseAnne Wanguku',
        notes: ''
      },
      { 
        client: clients[3]._id, 
        amount: 50000, 
        paymentDate: new Date('2025-12-05'), 
        paymentType: 'deposit', 
        billingPeriodLabel: 'Initial deposit',
        paymentMethod: 'cash',
        paidBy: 'Susan Mwakio',
        notes: ''
      },
      { 
        client: clients[3]._id, 
        amount: 20000, 
        paymentDate: new Date('2025-12-10'), 
        paymentType: 'monthly_fee', 
        billingPeriodLabel: 'Month 1 partial',
        paymentMethod: 'cash',
        paidBy: 'Susan Mwakio',
        notes: 'Partial payment'
      },
      { 
        client: clients[4]._id, 
        amount: 45000, 
        paymentDate: new Date('2026-01-10'), 
        paymentType: 'deposit', 
        billingPeriodLabel: 'Initial deposit',
        paymentMethod: 'mpesa',
        paidBy: 'Beatrice Kinyua',
        notes: ''
      },
      { 
        client: clients[4]._id, 
        amount: 55000, 
        paymentDate: new Date('2026-02-18'), 
        paymentType: 'monthly_fee', 
        billingPeriodLabel: 'Month 2',
        paymentMethod: 'mpesa',
        paidBy: 'Beatrice Kinyua',
        notes: ''
      },
    ]);
    console.log(`✅ Created ${payments.length} payments\n`);

    // Create alerts with correct field names
    console.log('🔔 Creating alerts...');
    const alerts = await Alert.insertMany([
      {
        client: clients[2]._id,
        alertType: 'MONTHLY_FEE_DUE',
        message: 'Monthly fee of 50,000 KES is overdue',
        severity: 'warning',
        isRead: false,
        isDismissed: false,
        amountDue: 50000,
        periodKey: `client_${clients[2]._id}_MONTHLY_FEE_DUE_2025_11`,
        triggeredAt: new Date(),
      },
      {
        client: clients[4]._id,
        alertType: 'EXPIRY_OVERDUE',
        message: 'Agreed 3-month duration expired. Daily charges of 1,500 KES/day now apply.',
        severity: 'critical',
        isRead: false,
        isDismissed: false,
        amountDue: 1500,
        daysPostExpiry: 7,
        periodKey: `client_${clients[4]._id}_EXPIRY_OVERDUE_2026_04`,
        triggeredAt: new Date('2026-04-01'),
      },
      {
        client: clients[3]._id,
        alertType: 'FIRST_MONTH_DUE',
        message: 'First month payment incomplete. Balance of 30,000 KES due.',
        severity: 'warning',
        isRead: false,
        isDismissed: false,
        amountDue: 30000,
        periodKey: `client_${clients[3]._id}_FIRST_MONTH_DUE_2025_12`,
        triggeredAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${alerts.length} alerts\n`);

    console.log('🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${sponsors.length} sponsors`);
    console.log(`   - ${clients.length} clients`);
    console.log(`   - ${payments.length} payments`);
    console.log(`   - ${alerts.length} alerts`);
    console.log('\n🚀 You can now start the server:');
    console.log('   cd /home/bkoimett/Downloads/carefacility');
    console.log('   npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error('\n📋 Detailed error:', error);
    process.exit(1);
  }
};

seedDatabase();
