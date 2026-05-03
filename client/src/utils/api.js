import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  res => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    const msg = error.response?.data?.message || error.message || 'Network error'
    return Promise.reject(new Error(msg))
  }
)

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
}

// ── Clients ──────────────────────────────────────────────────────────
export const clientsApi = {
  getAll: (params) => api.get('/clients', { params }),
  getClientsByStatus: (status) => api.get(`/clients/filter/${status}`),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  discharge: (id) => api.put(`/clients/${id}/discharge`),
  getBilling: (id) => api.get(`/clients/${id}/billing`),
}

// ── Sponsors ─────────────────────────────────────────────────────────
export const sponsorsApi = {
  getAll: (params) => api.get('/sponsors', { params }),
  getById: (id) => api.get(`/sponsors/${id}`),
  create: (data) => api.post('/sponsors', data),
  update: (id, data) => api.put(`/sponsors/${id}`, data),
  delete: (id) => api.delete(`/sponsors/${id}`),
}

// ── Payments ─────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getMonthlySummary: () => api.get('/payments/monthly-summary'),
}

// ── Alerts ───────────────────────────────────────────────────────────
export const alertsApi = {
  getAll: (params) => api.get('/alerts', { params }),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  dismiss: (id) => api.put(`/alerts/${id}/dismiss`),
  markAllRead: () => api.put('/alerts/mark-all-read'),
  triggerJob: () => api.post('/alerts/trigger-job'),
}

// ── Dashboard ────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getPaymentsMonthlySummary: () => api.get('/payments/monthly-summary'),
  getClientsDebtSummary: () => api.get('/clients/debt-summary'),
}

// ── Helpers ───────────────────────────────────────────────────────────
export const decodeToken = (token) => {
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

export default api

