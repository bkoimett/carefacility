// Demo Mode mock dataset for CareFacility MERN app
// Shapes are designed to match the frontend’s expectations (res.data.data / res.data.unreadCount etc.)
// All person names have been replaced with anime + Swahili inspired names (One Piece, Death Note, Jujutsu Kaisen)

const nowISO = new Date('2026-05-01T10:00:00.000Z')

const sponsors = [
  {
    _id: 'sp_001',
    name: 'Nami Wanjiku',
    phone: '+254 722 227341',
    email: 'nami@example.com',
    contactPhone: '+254 722 227341',
    contactEmail: 'nami@example.com',
    relationship: 'family',
    address: 'Nairobi CBD',
    notes: 'Primary contact',
    clientCount: 3,
    totalPaid: 155000
  },
  {
    _id: 'sp_002',
    name: 'Nobara Chebet',
    phone: '+254 701 474252',
    email: 'nobara@example.com',
    contactPhone: '+254 701 474252',
    contactEmail: 'nobara@example.com',
    relationship: 'friend',
    address: 'Kikuyu',
    notes: '',
    clientCount: 2,
    totalPaid: 90000
  },
  {
    _id: 'sp_003',
    name: 'Gojo Otieno',
    phone: '+254 722 316251',
    email: 'gojo@example.com',
    contactPhone: '+254 722 316251',
    contactEmail: 'gojo@example.com',
    relationship: 'employer',
    address: 'Ruiru',
    notes: '',
    clientCount: 1,
    totalPaid: 50000
  },
  {
    _id: 'sp_004',
    name: 'Light Kamau',
    phone: '+254 722 579286',
    email: 'light@example.com',
    contactPhone: '+254 722 579286',
    contactEmail: 'light@example.com',
    relationship: 'ngo',
    address: 'Kiambu',
    notes: '',
    clientCount: 1,
    totalPaid: 70000
  }
]

const clients = [
  {
    _id: 'cl_001',
    name: 'Yuji Omondi',
    gender: 'male',
    dateOfAdmission: '2025-07-28T00:00:00.000Z',
    agreedDurationMonths: 3,
    monthlyFee: 60000,
    medicalFee: 35000,
    status: 'active',
    sponsor: sponsors[1],
    depositAmount: 0,
    customDailyRate: 1500,
    comments: 'Regular follow-up needed',
    billing: {
      phase: 'within_duration',
      dailyRate: 1500,
      balance: -25000,
      totalCharged: 195000,
      totalPaid: 220000
    },
    payments: [],
    alerts: []
  },
  {
    _id: 'cl_002',
    name: 'Megumi Mwangi',
    gender: 'male',
    dateOfAdmission: '2025-09-24T00:00:00.000Z',
    agreedDurationMonths: 3,
    monthlyFee: 50000,
    medicalFee: 15000,
    status: 'active',
    sponsor: sponsors[0],
    depositAmount: 50000,
    customDailyRate: 1500,
    comments: 'Shifta case - Special handling',
    billing: {
      phase: 'within_duration',
      dailyRate: 1500,
      balance: 12000,
      totalCharged: 170000,
      totalPaid: 158000
    },
    payments: [],
    alerts: []
  },
  {
    _id: 'cl_003',
    name: 'Ryuk Juma',
    gender: 'male',
    dateOfAdmission: '2025-12-05T00:00:00.000Z',
    agreedDurationMonths: 3,
    monthlyFee: 40000,
    medicalFee: 30000,
    status: 'active',
    sponsor: sponsors[3],
    depositAmount: 50000,
    customDailyRate: 1500,
    comments: 'RESET_BILLING:monthly=40000,medical=30000',
    billing: {
      phase: 'within_duration',
      dailyRate: 1500,
      balance: 30000,
      totalCharged: 130000,
      totalPaid: 100000
    },
    payments: [],
    alerts: []
  },
  {
    _id: 'cl_004',
    name: 'L Mutua',
    gender: 'male',
    dateOfAdmission: '2026-01-10T00:00:00.000Z',
    agreedDurationMonths: 3,
    monthlyFee: 60000,
    medicalFee: 35000,
    status: 'active',
    sponsor: sponsors[0],
    depositAmount: 45000,
    customDailyRate: 1500,
    comments: 'Post-expiry daily charges started',
    billing: {
      phase: 'post_expiry',
      dailyRate: 1500,
      daysPostExpiry: 7,
      balance: 1500,
      totalCharged: 200000,
      totalPaid: 198500
    },
    payments: [],
    alerts: []
  },
  {
    _id: 'cl_005',
    name: 'Zoro Njoroge',
    gender: 'male',
    dateOfAdmission: '2025-02-13T00:00:00.000Z',
    agreedDurationMonths: 3,
    monthlyFee: 55000,
    medicalFee: 0,
    status: 'discharged',
    sponsor: sponsors[0],
    depositAmount: 0,
    customDailyRate: 1500,
    comments: 'DISCHARGED - Completed full term',
    billing: {
      phase: 'post_expiry',
      dailyRate: 1500,
      daysPostExpiry: 0,
      balance: 0,
      totalCharged: 165000,
      totalPaid: 165000
    },
    payments: [],
    alerts: []
  },
  {
    _id: 'cl_006',
    name: 'Maki Wambui',
    gender: 'female',
    dateOfAdmission: '2026-02-11T00:00:00.000Z',
    agreedDurationMonths: 6,
    monthlyFee: 45000,
    medicalFee: 25000,
    status: 'active',
    sponsor: sponsors[1],
    depositAmount: 50000,
    customDailyRate: 1500,
    comments: 'Long term care',
    billing: {
      phase: 'within_duration',
      dailyRate: 1500,
      balance: 0,
      totalCharged: 300000,
      totalPaid: 300000
    },
    payments: [],
    alerts: []
  }
]

const payments = [
  {
    _id: 'pay_001',
    client: clients[0],
    clientId: clients[0]._id,
    amount: 55000,
    paymentDate: '2025-11-19T00:00:00.000Z',
    paymentType: 'monthly_fee',
    billingPeriodLabel: 'Month 1',
    paymentMethod: 'cash',
    paidBy: sponsors[1].name,
    notes: 'First month payment'
  },
  {
    _id: 'pay_002',
    client: clients[0],
    clientId: clients[0]._id,
    amount: 55000,
    paymentDate: '2025-12-16T00:00:00.000Z',
    paymentType: 'monthly_fee',
    billingPeriodLabel: 'Month 2',
    paymentMethod: 'cash',
    paidBy: sponsors[1].name,
    notes: 'Second month payment'
  },
  {
    _id: 'pay_003',
    client: clients[1],
    clientId: clients[1]._id,
    amount: 50000,
    paymentDate: '2025-09-25T00:00:00.000Z',
    paymentType: 'deposit',
    billingPeriodLabel: 'Initial deposit',
    paymentMethod: 'mpesa',
    paidBy: sponsors[0].name,
    notes: 'Deposit'
  },
  {
    _id: 'pay_004',
    client: clients[1],
    clientId: clients[1]._id,
    amount: 50000,
    paymentDate: '2025-11-01T00:00:00.000Z',
    paymentType: 'monthly_fee',
    billingPeriodLabel: 'Month 2',
    paymentMethod: 'mpesa',
    paidBy: sponsors[0].name,
    notes: ''
  },
  {
    _id: 'pay_005',
    client: clients[2],
    clientId: clients[2]._id,
    amount: 50000,
    paymentDate: '2025-12-05T00:00:00.000Z',
    paymentType: 'deposit',
    billingPeriodLabel: 'Initial deposit',
    paymentMethod: 'cash',
    paidBy: sponsors[3].name,
    notes: ''
  },
  {
    _id: 'pay_006',
    client: clients[2],
    clientId: clients[2]._id,
    amount: 20000,
    paymentDate: '2025-12-10T00:00:00.000Z',
    paymentType: 'monthly_fee',
    billingPeriodLabel: 'Month 1 partial',
    paymentMethod: 'cash',
    paidBy: sponsors[3].name,
    notes: 'Partial payment'
  },
  {
    _id: 'pay_007',
    client: clients[3],
    clientId: clients[3]._id,
    amount: 45000,
    paymentDate: '2026-01-10T00:00:00.000Z',
    paymentType: 'deposit',
    billingPeriodLabel: 'Initial deposit',
    paymentMethod: 'mpesa',
    paidBy: sponsors[0].name,
    notes: ''
  },
  {
    _id: 'pay_008',
    client: clients[3],
    clientId: clients[3]._id,
    amount: 55000,
    paymentDate: '2026-02-18T00:00:00.000Z',
    paymentType: 'monthly_fee',
    billingPeriodLabel: 'Month 2',
    paymentMethod: 'mpesa',
    paidBy: sponsors[0].name,
    notes: ''
  },
  {
    _id: 'pay_009',
    client: clients[5],
    clientId: clients[5]._id,
    amount: 45000,
    paymentDate: '2026-03-05T00:00:00.000Z',
    paymentType: 'monthly_fee',
    billingPeriodLabel: 'Month 1',
    paymentMethod: 'mpesa',
    paidBy: sponsors[1].name,
    notes: ''
  },
  {
    _id: 'pay_010',
    client: clients[4],
    clientId: clients[4]._id,
    amount: 55000,
    paymentDate: '2025-03-18T00:00:00.000Z',
    paymentType: 'monthly_fee',
    billingPeriodLabel: 'Month 1',
    paymentMethod: 'cash',
    paidBy: sponsors[0].name,
    notes: 'Closed case'
  }
]

const alerts = [
  {
    _id: 'al_001',
    client: clients[1],
    clientId: clients[1]._id,
    alertType: 'MONTHLY_FEE_DUE',
    message: 'Monthly fee of 50,000 KES is overdue',
    severity: 'warning',
    isRead: false,
    isDismissed: false,
    amountDue: 50000,
    periodKey: 'client_cl_002_MONTHLY_FEE_DUE_2025_11',
    triggeredAt: '2025-11-20T00:00:00.000Z',
    createdAt: '2025-11-20T00:00:00.000Z'
  },
  {
    _id: 'al_002',
    client: clients[3],
    clientId: clients[3]._id,
    alertType: 'EXPIRY_OVERDUE',
    message: 'Agreed 3-month duration expired. Daily charges of 1,500 KES/day now apply.',
    severity: 'critical',
    isRead: false,
    isDismissed: false,
    amountDue: 1500,
    daysPostExpiry: 7,
    periodKey: 'client_cl_004_EXPIRY_OVERDUE_2026_04',
    triggeredAt: '2026-04-01T00:00:00.000Z',
    createdAt: '2026-04-01T00:00:00.000Z'
  },
  {
    _id: 'al_003',
    client: clients[2],
    clientId: clients[2]._id,
    alertType: 'FIRST_MONTH_DUE',
    message: 'First month payment incomplete. Balance of 30,000 KES due.',
    severity: 'warning',
    isRead: false,
    isDismissed: false,
    amountDue: 30000,
    periodKey: 'client_cl_003_FIRST_MONTH_DUE_2025_12',
    triggeredAt: '2025-12-12T00:00:00.000Z',
    createdAt: '2025-12-12T00:00:00.000Z'
  },
  {
    _id: 'al_004',
    client: clients[0],
    clientId: clients[0]._id,
    alertType: 'EXPIRY_WARNING',
    message: 'Client duration is approaching expiry within 10 days.',
    severity: 'info',
    isRead: true,
    isDismissed: false,
    amountDue: 0,
    periodKey: 'client_cl_001_EXPIRY_WARNING_2026_04',
    triggeredAt: '2026-04-15T00:00:00.000Z',
    createdAt: '2026-04-15T00:00:00.000Z'
  },
  {
    _id: 'al_005',
    client: clients[5],
    clientId: clients[5]._id,
    alertType: 'SPONSOR_REMINDER',
    message: 'Sponsor follow-up requested: confirm next payment arrangement.',
    severity: 'info',
    isRead: false,
    isDismissed: false,
    amountDue: 0,
    periodKey: 'client_cl_006_SPONSOR_REMINDER_2026_04',
    triggeredAt: '2026-04-22T00:00:00.000Z',
    createdAt: '2026-04-22T00:00:00.000Z'
  }
]

// Dashboard stats (matches what Dashboard.jsx dereferences)
const dashboardStats = {
  clients: {
    active: clients.filter(c => c.status === 'active').length,
    total: clients.length
  },
  revenue: {
    thisMonth: 185000,
    lastMonth: 132000,
    total: 1455000,
    revenueTrend: []
  },
  outstanding: {
    total: 31500,
    clients: [
      {
        _id: 'cl_002',
        name: clients[1].name,
        phase: 'within_duration',
        balance: 12000
      },
      {
        _id: 'cl_003',
        name: clients[2].name,
        phase: 'within_duration',
        balance: 30000
      },
      {
        _id: 'cl_004',
        name: clients[3].name,
        phase: 'post_expiry',
        daysPostExpiry: 7,
        balance: 1500
      }
    ]
  },
  alerts: {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length
  },
  recentPayments: payments
    .slice()
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
    .slice(0, 5)
    .map(p => ({
      _id: p._id,
      client: { _id: p.clientId, name: p.client.name },
      amount: p.amount,
      paymentType: p.paymentType,
      paidBy: p.paidBy,
      paymentDate: p.paymentDate
    }))
}

// revenueTrend shape used by Dashboard.jsx
const revenueTrend = [
  { _id: { month: 12, year: 2025 }, total: 90000, count: 3 },
  { _id: { month: 1, year: 2026 }, total: 105000, count: 4 },
  { _id: { month: 2, year: 2026 }, total: 120000, count: 4 },
  { _id: { month: 3, year: 2026 }, total: 98000, count: 3 },
  { _id: { month: 4, year: 2026 }, total: 132000, count: 4 },
  { _id: { month: 5, year: 2026 }, total: 185000, count: 5 }
]

dashboardStats.revenue.revenueTrend = revenueTrend

const demoUser = {
  _id: 'demo_user',
  name: 'Demo User',
  email: 'demo@carefacility.com',
  role: 'admin'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function pickFirstById(arr, id) {
  return arr.find(x => x._id === id)
}

function matchUrl(url) {
  return url || ''
}

export function getMockDataForEndpoint(url, axiosConfig = {}) {
  const u = matchUrl(url)
  const params = axiosConfig?.params || {}

  if (u.includes('/auth/me')) {
    return { data: { data: { user: demoUser } } }
  }

  if (u.includes('/dashboard/stats')) {
    return { data: { data: { ...dashboardStats, revenueTrend } } }
  }

  if (u.includes('/dashboard/revenue-trend')) {
    return { data: { data: revenueTrend } }
  }

  if (u.includes('/alerts') && u.includes('/mark-all-read') && axiosConfig?.method === 'put') {
    return { data: { data: true } }
  }

  if (u.includes('/alerts/')) {
    if (u.includes('/read') && axiosConfig?.method === 'put') {
      return { data: { data: true } }
    }
    if (u.includes('/dismiss') && axiosConfig?.method === 'put') {
      return { data: { data: true } }
    }
  }

  if (u.includes('/alerts/trigger-job') && axiosConfig?.method === 'post') {
    return { data: { data: { triggered: true } } }
  }

  if (u.includes('/alerts')) {
    const severity = params.severity
    const isDismissed = params.isDismissed
    const limit = params.limit

    let result = alerts.slice()
    if (severity) result = result.filter(a => a.severity === severity)
    if (typeof isDismissed === 'boolean') result = result.filter(a => a.isDismissed === isDismissed)

    const unreadCount = result.filter(a => !a.isRead).length

    if (typeof limit === 'number') result = result.slice(0, limit)

    return {
      data: {
        data: result,
        unreadCount
      }
    }
  }

  if (u.includes('/sponsors')) {
    if (u.includes('/sponsors/') && axiosConfig?.method === 'get') {
      const id = u.split('/').pop()
      const s = pickFirstById(sponsors, id)
      return { data: s || null }
    }

    const search = (params.search || '').toLowerCase()
    let list = sponsors.slice()
    if (search) {
      list = list.filter(s => (s.name || '').toLowerCase().includes(search))
    }
    return { data: list }
  }

  if (u.includes('/clients/debt-summary')) {
    return { data: { data: dashboardStats.outstanding } }
  }

  if (u.includes('/clients/filter/')) {
    const status = u.split('/').pop()
    let list = clients.slice()

    if (status && status !== 'all') {
      list = list.filter(c => c.status === status)
    }

    return {
      data: {
        data: {
          clients: list,
          counts: {
            active: clients.filter(c => c.status === 'active').length,
            discharged: clients.filter(c => c.status === 'discharged').length,
            all: clients.length
          }
        }
      }
    }
  }

  if (u.includes('/clients/') && u.match(/\/clients\/[A-Za-z0-9_\-]+$/)) {
    const id = u.split('/').pop()
    const c = pickFirstById(clients, id)
    if (!c) return { data: { data: null } }

    const clientPayments = payments.filter(p => p.clientId === id)
    const clientAlerts = alerts.filter(a => a.clientId === id)

    return {
      data: {
        data: {
          ...c,
          sponsor: c.sponsor,
          billing: {
            ...c.billing,
            daysPostExpiry: c.billing?.daysPostExpiry || 0
          },
          payments: clientPayments,
          alerts: clientAlerts
        }
      }
    }
  }

  if (u.includes('/clients') && u.match(/\/clients$/)) {
    return { data: { data: clients } }
  }

  if (u.includes('/payments/monthly-summary')) {
    return { data: { data: [] } }
  }

  if (u.includes('/payments')) {
    return { data: { data: [] } }
  }

  if (u.includes('/payments/') && u.includes('/receipt') && axiosConfig?.method === 'get') {
    return { data: { data: null } }
  }

  return { data: { data: [] } }
}
