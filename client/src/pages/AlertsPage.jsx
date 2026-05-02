import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { alertsApi } from '../utils/api'
import { useFetch, useAsync } from '../hooks/useFetch'
import { formatKES, formatDate, getAlertTypeIcon, timeAgo } from '../utils/formatters'
import { PageHeader, Spinner, EmptyState, ErrorState } from '../components/ui'
import { AlertOctagon, AlertTriangle, Info } from 'lucide-react'

const SEVERITY_STYLES = {
  critical: {
    accent: '#EF4444',
    iconBg: 'rgba(239,68,68,0.1)',
    iconColor: '#EF4444',
    badge: 'badge-negative'
  },
  warning: {
    accent: '#F59E0B',
    iconBg: 'rgba(245,158,11,0.1)',
    iconColor: '#F59E0B',
    badge: 'badge-warning'
  },
  info: {
    accent: '#06B6D4',
    iconBg: 'rgba(6,182,212,0.1)',
    iconColor: '#06B6D4',
    badge: 'badge-cyan'
  }
}

const ALERT_TYPE_LABELS = {
  FIRST_MONTH_DUE: 'First Month Due',
  MONTHLY_FEE_DUE: 'Monthly Fee Due',
  EXPIRY_WARNING: 'Expiry Warning',
  EXPIRY_OVERDUE: 'Expiry Overdue',
  SPONSOR_REMINDER: 'Sponsor Reminder',
  DAILY_CHARGE_ALERT: 'Daily Charge Update',
}

export default function AlertsPage() {
  const navigate = useNavigate()
  const [severityFilter, setSeverityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showDismissed, setShowDismissed] = useState(false)

  const params = {
    severity: severityFilter !== 'all' ? severityFilter : undefined,
    isDismissed: showDismissed ? undefined : false,
    limit: 100
  }

  const { data, loading, error, refetch } = useFetch(
    () => alertsApi.getAll(params),
    [severityFilter, showDismissed]
  )
  const { run, loading: actioning } = useAsync()

  const allAlerts = data?.data || data || []
  const unreadCount = data?.unreadCount ?? 0

  // Client-side type filter
  const alerts = typeFilter === 'all'
    ? allAlerts
    : allAlerts.filter(a => a.alertType === typeFilter)

  const handleDismiss = async (id) => {
    await run(() => alertsApi.dismiss(id))
    refetch()
  }

  const handleMarkRead = async (id) => {
    await run(() => alertsApi.markRead(id))
    refetch()
  }

  const handleMarkAllRead = async () => {
    await run(() => alertsApi.markAllRead())
    refetch()
  }

  const handleTriggerJob = async () => {
    await run(() => alertsApi.triggerJob())
    refetch()
  }

  const criticalCount = allAlerts.filter(a => a.severity === 'critical' && !a.isRead).length
  const warningCount = allAlerts.filter(a => a.severity === 'warning' && !a.isRead).length

  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#F0F4FF]">Alerts</h1>
          <p className="text-[#3D4F6B] text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread · ${allAlerts.length} total` : `${allAlerts.length} alerts`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            className="btn-premium flex items-center gap-2 justify-center w-full sm:w-auto"
            onClick={handleTriggerJob}
            disabled={actioning}
          >
            {actioning ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
              </svg>
            )}
            Run Check
          </button>
          {unreadCount > 0 && (
            <button
              className="btn-premium flex items-center gap-2 justify-center w-full sm:w-auto"
              onClick={handleMarkAllRead}
              disabled={actioning}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Summary Banners */}
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
              <span className="text-[#EF4444] text-sm font-medium">
                {criticalCount} critical unread alert{criticalCount !== 1 ? 's' : ''} require attention
              </span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <path d="M12 16v-4M12 16l-1 3M12 16l1 3M8 3.5a3.5 3.5 0 1 1 8 0" />
              </svg>
              <span className="text-[#F59E0B] text-sm font-medium">
                {warningCount} warning{warningCount !== 1 ? 's' : ''} need review
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        {/* Severity Filter Tabs - scrollable on mobile */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex items-center gap-1 min-w-max">
            {['all', 'critical', 'warning', 'info'].map(s => (
              <button
                key={s}
                className={`px-4 py-1.5 text-sm rounded-[6px] transition-all duration-150 whitespace-nowrap ${
                  severityFilter === s
                    ? 'bg-[#1A263D] text-[#F0F4FF] font-medium'
                    : 'text-[#6B7FA3]'
                }`}
                onClick={() => setSeverityFilter(s)}
              >
                {s === 'all' ? `All (${allAlerts.length})` : s.charAt(0).toUpperCase() + s.slice(1)}
                {(severityFilter !== s || s === 'all') && (
                  <span className={`text-[8px] ml-1.5 rounded-full px-1.5 py-0.5 ${
                    severityFilter === s ? 'bg-[#06B6D4] text-white' : 'bg-[#1A263D] text-[#6B7FA3]'
                  }`}>
                    {s === 'all' ? allAlerts.length : allAlerts.filter(a => a.severity === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            className="bg-[#0B1426] border border-[#1A263D] rounded-[8px] pl-3 pr-8 py-2 text-sm text-[#F0F4FF] appearance-none focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[rgba(6,182,212,0.2)] transition-all min-w-[140px]"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.entries(ALERT_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val} className="bg-[#0B1426] text-[#F0F4FF]">{label}</option>
            ))}
          </select>
          <svg className="w-4 h-4 text-[#3D4F6B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Toggle Dismissed */}
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors whitespace-nowrap">
          <div className="w-4 h-4 rounded-[3px] border border-[#1A263D] flex items-center justify-center flex-shrink-0">
            {showDismissed && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>
          <span>Show dismissed</span>
        </label>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card-premium p-6 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#070D19]/50 mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3D4F6B" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h3 className="text-[#F0F4FF] text-lg font-semibold mb-2">
            {severityFilter !== 'all' ? `No ${severityFilter} alerts` : 'All clear!'}
          </h3>
          <p className="text-[#3D4F6B] text-sm">No alerts matching your current filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info
            return (
              <div
                key={alert._id}
                className="card-premium px-4 py-3.5 sm:px-6 sm:py-4 relative overflow-hidden group hover:border-[#1A263D]/60 transition-all duration-200"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ backgroundColor: style.accent }}></div>

                <div className="flex items-start gap-4">
                  {/* Severity icon */}
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: style.iconBg }}>
                    {alert.severity === 'critical' && <AlertOctagon size={20} style={{ color: style.iconColor }} />}
                    {alert.severity === 'warning' && <AlertTriangle size={20} style={{ color: style.iconColor }} />}
                    {alert.severity === 'info' && <Info size={20} style={{ color: style.iconColor }} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${style.badge}`}>{style.label}</span>
                      <span className="w-1 h-1 rounded-full bg-[#1A263D] flex-shrink-0"></span>
                      <span className="text-xs text-[#3D4F6B]">{alert.client?.name || 'System'}</span>
                      {!alert.isRead && <span className="badge badge-xs badge-[#06B6D4] ml-auto">Unread</span>}
                    </div>

                    <p className="text-[#F0F4FF] text-sm font-medium mt-2 leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.amountDue > 0 && (
                      <p className="text-xs font-mono mt-2 text-[#EF4444]">
                        Amount: <span className="font-semibold">{formatKES(alert.amountDue)}</span>
                      </p>
                    )}

                    <p className="text-xs text-[#3D4F6B] mt-2 font-mono">{timeAgo(alert.createdAt)}</p>
                  </div>

                  {/* Right actions - always visible on mobile */}
                  <div className="flex flex-col gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-2 sm:mt-0">
                    {!alert.isRead && (
                      <button
                        className="text-xs text-[#06B6D4] hover:underline px-2 py-1"
                        onClick={() => handleMarkRead(alert._id)}
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      className="text-xs text-[#3D4F6B] hover:text-[#EF4444] hover:underline px-2 py-1"
                      onClick={() => handleDismiss(alert._id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
