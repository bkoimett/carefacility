import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { alertsApi } from '../utils/api'
import { useFetch, useAsync } from '../hooks/useFetch'
import {
  formatKES, formatDate, getAlertTypeIcon, timeAgo
} from '../utils/formatters'
import { PageHeader, Spinner, EmptyState, ErrorState } from '../components/ui'

const SEVERITY_STYLES = {
  critical: {
    container: 'bg-error/5 border-error/25 hover:bg-error/10',
    badge: 'badge-error',
    dot: 'bg-error',
    label: 'Critical'
  },
  warning: {
    container: 'bg-warning/5 border-warning/25 hover:bg-warning/10',
    badge: 'badge-warning',
    dot: 'bg-warning',
    label: 'Warning'
  },
  info: {
    container: 'bg-info/5 border-info/25 hover:bg-info/10',
    badge: 'badge-info',
    dot: 'bg-info',
    label: 'Info'
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
    <div className="space-y-5">
      <PageHeader
        title="Alerts Inbox"
        subtitle={unreadCount > 0 ? `${unreadCount} unread · ${allAlerts.length} total` : `${allAlerts.length} alerts`}
        actions={
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-ghost gap-1"
              onClick={handleTriggerJob}
              disabled={actioning}
              title="Re-run daily alert check now"
            >
              {actioning ? <span className="loading loading-spinner loading-xs" /> : '🔄'}
              Run Check
            </button>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline gap-1"
                onClick={handleMarkAllRead}
                disabled={actioning}
              >
                ✓ Mark All Read
              </button>
            )}
          </div>
        }
      />

      {/* Summary chips */}
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {criticalCount > 0 && (
            <div className="alert alert-error py-2 text-sm gap-2 w-auto">
              <span>🚨</span>
              <span><strong>{criticalCount}</strong> critical unread alerts require attention</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="alert alert-warning py-2 text-sm gap-2 w-auto">
              <span>⚠️</span>
              <span><strong>{warningCount}</strong> warnings need review</span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Severity tabs */}
        <div className="tabs tabs-boxed bg-base-200 text-sm">
          {['all', 'critical', 'warning', 'info'].map(s => (
            <button
              key={s}
              className={`tab tab-sm capitalize ${severityFilter === s ? 'tab-active' : ''}`}
              onClick={() => setSeverityFilter(s)}
            >
              {s === 'all' ? `All (${allAlerts.length})` : s}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          className="select select-bordered select-sm text-sm"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          {Object.entries(ALERT_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {/* Toggle dismissed */}
        <label className="flex items-center gap-2 cursor-pointer text-sm text-base-content/60">
          <input
            type="checkbox"
            className="checkbox checkbox-xs"
            checked={showDismissed}
            onChange={e => setShowDismissed(e.target.checked)}
          />
          Show dismissed
        </label>
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon="✅"
          title={severityFilter !== 'all' ? `No ${severityFilter} alerts` : 'All clear!'}
          message="No alerts matching your current filters"
        />
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info
            return (
              <div
                key={alert._id}
                className={`
                  flex items-start gap-3 p-4 rounded-2xl border transition-all
                  ${style.container}
                  ${!alert.isRead ? 'ring-1 ring-inset ring-primary/15' : 'opacity-80'}
                `}
              >
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  {!alert.isRead
                    ? <span className={`block w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
                    : <span className="block w-2 h-2 rounded-full bg-base-300" />
                  }
                </div>

                {/* Icon */}
                <span className="text-xl shrink-0 mt-0.5">
                  {getAlertTypeIcon(alert.alertType)}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`badge badge-xs ${style.badge}`}>{style.label}</span>
                    <span className="text-xs font-mono text-base-content/40 uppercase">
                      {ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}
                    </span>
                    {!alert.isRead && <span className="badge badge-xs badge-primary">Unread</span>}
                  </div>

                  {/* Client name - clickable */}
                  {alert.client && (
                    <button
                      className="text-xs font-semibold text-primary hover:underline mb-1 block"
                      onClick={() => navigate(`/clients/${alert.client._id}`)}
                    >
                      👤 {alert.client.name}
                    </button>
                  )}

                  <p className="text-sm leading-relaxed">{alert.message}</p>

                  {alert.amountDue > 0 && (
                    <p className="text-xs font-mono mt-1 text-base-content/60">
                      Amount: <span className="font-semibold text-error">{formatKES(alert.amountDue)}</span>
                    </p>
                  )}

                  <p className="text-xs text-base-content/30 mt-1.5 font-mono">
                    {timeAgo(alert.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  {!alert.isRead && (
                    <button
                      className="btn btn-xs btn-ghost text-xs"
                      onClick={() => handleMarkRead(alert._id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => handleDismiss(alert._id)}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
