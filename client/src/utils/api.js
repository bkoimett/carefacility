import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || err.message || 'Network error'
    return Promise.reject(new Error(msg))
  }
)

// ── Clients ──────────────────────────────────────────────────────────
export const clientsApi = {
  getAll: (params) => api.get('/clients', { params }),
  getClientsByStatus: (status) => api.get(`/clients/filter/${status}`),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
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
}

export default api
