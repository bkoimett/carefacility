import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../utils/api'
import { formatKES, formatDate } from '../utils/formatters'
import { Modal } from './ui'
import { showError } from './ToastNotifications'

export function DebtDetails({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalDebt, setTotalDebt] = useState(0)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await dashboardApi.getClientsDebtSummary()
      setData(response.data?.clients || [])
      setTotalDebt(response.data?.totalDebt || 0)
    } catch (err) {
      showError(err.message || 'Failed to load debt data')
    } finally {
      setLoading(false)
    }
  }

  const getOverdueColor = (daysOverdue, phase) => {
    if (phase === 'post_expiry') {
      return 'text-error'
    }
    if (daysOverdue > 30) {
      return 'text-error'
    }
    if (daysOverdue >= 15) {
      return 'text-warning'
    }
    return 'text-success'
  }

  const getOverdueLabel = (daysOverdue, phase) => {
    if (phase === 'post_expiry') {
      return `${daysOverdue}d post-expiry`
    }
    if (daysOverdue > 30) {
      return `>30d overdue`
    }
    if (daysOverdue >= 15) {
      return `15-30d overdue`
    }
    if (daysOverdue > 0) {
      return `<15d overdue`
    }
    return 'Current'
  }

  if (!isOpen) return null

  return (
    <Modal id="debt-details" isOpen={isOpen} onClose={onClose} size="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl">Outstanding Debt</h3>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Total debt summary */}
      <div className="bg-base-200 rounded-xl p-4 mb-4">
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-display font-semibold text-error">
            {formatKES(totalDebt)}
          </p>
          <p className="text-sm text-base-content/50">total outstanding</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-base-200 rounded-xl h-16 shimmer animate-shimmer"></div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-base-content/30">
          ✨ No outstanding debt!
        </div>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {data.map((client) => {
            const overdueColor = getOverdueColor(client.daysOverdue, client.phase)
            const overdueLabel = getOverdueLabel(client.daysOverdue, client.phase)

            return (
              <div
                key={client._id}
                className="flex items-center justify-between p-3 rounded-xl border border-base-300 hover:bg-base-200 transition-colors cursor-pointer"
                onClick={() => {
                  navigate(`/clients/${client._id}`)
                  onClose()
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error font-bold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${overdueColor}`}>
                        {overdueLabel}
                      </span>
                      {client.sponsor && (
                        <span className="text-xs text-base-content/40">
                          via {client.sponsor.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-error text-lg">
                    −{formatKES(Math.abs(client.balance))}
                  </p>
                  {client.phase === 'post_expiry' && (
                    <p className="text-xs text-warning font-mono">
                      {client.daysPostExpiry}d post-expiry
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}