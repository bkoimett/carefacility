import axios from 'axios'

// Use environment-specific base URL
// In production (Vercel), VITE_API_URL should be set to the full Render backend URL WITHOUT /api
// e.g., https://carefacility-backend.onrender.com
// In development, it falls back to relative /api paths
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const apiClient = axios.create({ 
  baseURL, 
  timeout: 30000,
  withCredentials: true
})

// Log requests for debugging
apiClient.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data ? JSON.stringify(config.data) : '')
  const token = localStorage.getItem('accessToken')
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, (err) => {
  console.error('[API] Request error:', err)
  return Promise.reject(err)
})

// Response interceptor with logging
apiClient.interceptors.response.use(
  (res) => {
    console.log(`[API] ${res.status} ${res.config.method?.toUpperCase()} ${res.config.url}`, res.data)
    return res
  },
  (err) => {
    console.error(`[API] ${err.response?.status || 'NETWORK'} ${err.config?.method?.toUpperCase()} ${err.config?.url}`, err.message)
    return Promise.reject(err)
  }
)

export const clientsApi = {
  getAll: (params) => apiClient.get('/clients', { params }),
  getById: (id) => apiClient.get(`/clients/${id}`),
  create: (data) => apiClient.post('/clients', data),
  update: (id, data) => apiClient.put(`/clients/${id}`, data),
  discharge: (id) => apiClient.put(`/clients/${id}/discharge`),
  delete: (id) => apiClient.delete(`/clients/${id}`),
  getDebtSummary: () => apiClient.get('/clients/debt-summary'),
  filter: (status) => apiClient.get(`/clients/filter/${status}`),
  getClientsByStatus: (status) => apiClient.get(`/clients/filter/${status}`),
}

export const paymentsApi = {
  getAll: (params) => apiClient.get('/payments', { params }),
  create: (data) => apiClient.post('/payments', data),
  update: (id, data) => apiClient.put(`/payments/${id}`, data),
  delete: (id) => apiClient.delete(`/payments/${id}`),
  getMonthlySummary: () => apiClient.get('/payments/monthly-summary'),
  getReceipt: async (paymentId) => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${baseURL}/payments/${paymentId}/receipt`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) throw new Error(`Receipt failed: ${response.status}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${paymentId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}

export const sponsorsApi = {
  getAll: () => apiClient.get('/sponsors'),
  getById: (id) => apiClient.get(`/sponsors/${id}`),
  create: (data) => apiClient.post('/sponsors', data),
  update: (id, data) => apiClient.put(`/sponsors/${id}`, data),
  delete: (id) => apiClient.delete(`/sponsors/${id}`),
}

export const alertsApi = {
  getAll: (params) => apiClient.get('/alerts', { params }),
  markRead: (id) => apiClient.put(`/alerts/${id}/read`),
  dismiss: (id) => apiClient.put(`/alerts/${id}/dismiss`),
  markAllRead: () => apiClient.put('/alerts/mark-all-read'),
  triggerJob: () => apiClient.post('/alerts/trigger-job'),
}

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getRevenueTrend: () => apiClient.get('/dashboard/revenue-trend'),
  getPaymentsMonthlySummary: () => apiClient.get('/payments/monthly-summary'),
  getClientsDebtSummary: () => apiClient.get('/clients/debt-summary'),
}


// Demo mode support (session-based)
import { getMockDataForEndpoint } from '../demo/data'

function isDemoModeActive() {
  return sessionStorage.getItem('demoMode') === 'true'
}

apiClient.interceptors.request.use((config) => {
  if (!isDemoModeActive()) return config

  // Never mock auth/me/login; demo bypass should avoid them.
  const url = config.url || ''
  if (url.includes('/auth/me') || url.includes('/auth/login')) return config

  // axios request interceptor can't truly cancel the request; we return a special config and handle in adapter.
  // Instead, we short-circuit in the response interceptor by returning mock data.
  return config
})

apiClient.interceptors.response.use(
  (res) => {
    if (!isDemoModeActive()) return res
    const configUrl = res?.config?.url || ''
    // If request actually succeeded (backend available), keep it.
    return res
  },
  async (err) => {
    // If we are in demo mode, return mock data for the failed request.
    if (isDemoModeActive()) {
      const config = err?.config
      const url = config?.url || ''
      const axiosConfig = {
        params: config?.params,
        method: config?.method
      }

      // Simulate latency ~300ms
      await new Promise(resolve => setTimeout(resolve, 300))

      try {
        const mockRes = getMockDataForEndpoint(url, axiosConfig)
        return mockRes
      } catch (mockErr) {
        console.error('[DEMO] mock failed:', mockErr)
      }
    }

    return Promise.reject(err)
  }
)

// Demo mode support (session-based) must be declared before endpoint exports for ESM correctness.
export { apiClient } 
export default apiClient


