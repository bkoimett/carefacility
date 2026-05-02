import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, paymentsApi } from '../utils/api'
import { formatKES, formatDate } from '../utils/formatters'
import { Modal } from './ui'
import { showError } from './ToastNotifications'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function RevenueDetails({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedMonth, setExpandedMonth] = useState(null)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalPayments, setTotalPayments] = useState(0)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await dashboardApi.getPaymentsMonthlySummary()
      setData(response.data || [])

      // Calculate totals
      const totalRev = response.data.reduce((sum, m) => sum + (m.total || 0), 0)
      const totalPmts = response.data.reduce((sum, m) => sum + (m.count || 0), 0)
      setTotalRevenue(totalRev)
      setTotalPayments(totalPmts)
    } catch (err) {
      showError(err.message || 'Failed to load revenue data')
    } finally {
      setLoading(false)
    }
  }

  const toggleMonth = (index) => {
    setExpandedMonth(expandedMonth === index ? null : index)
  }

  if (!isOpen) return null

  return (
    <Modal id="revenue-details" isOpen={isOpen} onClose={onClose} size="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl">Revenue Details</h3>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Total summary */}
      <div className="bg-base-200 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-base-content/50 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-display font-semibold text-success">
              {formatKES(totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-base-content/50 uppercase tracking-wider mb-1">Total Payments</p>
            <p className="text-2xl font-display font-semibold text-primary">
              {totalPayments}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-base-200 rounded-xl h-20 shimmer animate-shimmer"></div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-base-content/30">
          No payment data available
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {data.map((month, idx) => {
            const monthName = `${MONTHS[month._id.month - 1]} ${month._id.year}`
            const isExpanded = expandedMonth === idx

            return (
              <div key={idx} className="border border-base-300 rounded-xl overflow-hidden">
                {/* Month header */}
                <button
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-base-200 transition-colors"
                  onClick={() => toggleMonth(idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display font-semibold">{monthName}</span>
                    <span className="badge badge-primary">{formatKES(month.total)}</span>
                    <span className="text-xs text-base-content/40">{month.count} payments</span>
                  </div>
                  <span className="text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}">
                    ▼
                  </span>
                </button>

                {/* Expanded payments */}
                {isExpanded && (
                  <div className="border-t border-base-300 bg-base-100/50">
                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full">
                        <thead>
                          <tr className="text-xs uppercase tracking-wider text-base-content/50">
                            <th className="font-semibold">Client</th>
                            <th className="font-semibold">Amount</th>
                            <th className="font-semibold">Date</th>
                            <th className="font-semibold">Method</th>
                            <th className="font-semibold">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {month.payments && month.payments.length > 0 ? (
                            month.payments.map((p) => (
                              <tr
                                key={p._id}
                                className="table-row-hover cursor-pointer"
                                onClick={() => {
                                  if (p.client) {
                                    navigate(`/clients/${p.client._id}`)
                                    onClose()
                                  }
                                }}
                              >
                                <td className="font-medium">
                                  {p.client ? p.client.name : '—'}
                                </td>
                                <td className="font-mono text-success font-semibold">
                                  {formatKES(p.amount)}
                                </td>
                                <td className="text-xs font-mono text-base-content/60">
                                  {formatDate(p.paymentDate)}
                                </td>
                                <td>
                                  <span className="badge badge-ghost badge-xs capitalize">
                                    {p.paymentMethod?.replace(/_/g, ' ') || '—'}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge badge-ghost badge-xs capitalize">
                                    {p.paymentType?.replace(/_/g, ' ') || '—'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-base-content/30">
                                No payments
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}