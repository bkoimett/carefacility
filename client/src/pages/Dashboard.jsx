import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { dashboardApi, alertsApi } from '../utils/api'
import { formatKES, formatDate, getAlertTypeIcon, timeAgo } from '../utils/formatters'
import { StatCard, Spinner, ErrorState, PageHeader } from '../components/ui'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [statsRes, alertsRes] = await Promise.all([
          dashboardApi.getStats(),
          alertsApi.getAll({ limit: 6, isDismissed: false })
        ])
        setStats(statsRes.data.data)
        setAlerts(alertsRes.data.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const trendData = (stats?.revenueTrend || []).map(d => ({
    name: `${MONTHS[d._id.month - 1]} ${d._id.year}`,
    revenue: d.total,
    payments: d.count
  }))

  const totalAlerts = (stats?.alerts?.critical || 0) + (stats?.alerts?.warning || 0) + (stats?.alerts?.info || 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Overview · ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Clients"
          value={stats?.clients?.active ?? 0}
          sub={`${stats?.clients?.total ?? 0} total clients`}
          icon="👥"
          colorClass="text-primary"
        />
        <StatCard
          label="Revenue This Month"
          value={formatKES(stats?.revenue?.thisMonth)}
          sub={`${formatKES(stats?.revenue?.total)} all time`}
          icon="💰"
          colorClass="text-success"
        />
        <StatCard
          label="Outstanding Debt"
          value={formatKES(stats?.outstanding?.total)}
          sub={`${(stats?.outstanding?.clients || []).length} clients overdue`}
          icon="⚠️"
          colorClass={stats?.outstanding?.total > 0 ? 'text-error' : 'text-success'}
        />
        <StatCard
          label="Unread Alerts"
          value={totalAlerts}
          sub={`${stats?.alerts?.critical || 0} critical`}
          icon="🔔"
          colorClass={stats?.alerts?.critical > 0 ? 'text-error' : 'text-warning'}
        />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Post-Expiry"
          value={stats?.clients?.postExpiry ?? 0}
          sub="accruing daily charges"
          icon="📈"
          colorClass={stats?.clients?.postExpiry > 0 ? 'text-warning' : 'text-base-content/50'}
        />
        <StatCard
          label="Discharged"
          value={stats?.clients?.discharged ?? 0}
          sub="completed stays"
          icon="✅"
          colorClass="text-base-content/60"
        />
        <StatCard
          label="Absconded"
          value={stats?.clients?.absconded ?? 0}
          sub="flagged cases"
          icon="🚩"
          colorClass={stats?.clients?.absconded > 0 ? 'text-warning' : 'text-base-content/50'}
        />
        <StatCard
          label="Critical Alerts"
          value={stats?.alerts?.critical ?? 0}
          sub={`${stats?.alerts?.warning ?? 0} warnings`}
          icon="🚨"
          colorClass={stats?.alerts?.critical > 0 ? 'text-error' : 'text-base-content/50'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue trend */}
        <div className="stat-card">
          <h3 className="font-display text-base mb-4">Revenue Trend (6 months)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--p))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--p))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [formatKES(v), 'Revenue']}
                  contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--bc)/0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--p))" strokeWidth={2}
                  fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">
              No payment data yet
            </div>
          )}
        </div>

        {/* Payment volume */}
        <div className="stat-card">
          <h3 className="font-display text-base mb-4">Payment Count by Month</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v) => [v, 'Payments']}
                  contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="payments" fill="hsl(var(--s))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">
              No payment data yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: overdue + recent alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most overdue clients */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base">Most Overdue Clients</h3>
            <button onClick={() => navigate('/clients?status=active')} className="btn btn-xs btn-ghost text-primary">
              View all →
            </button>
          </div>
          {(stats?.outstanding?.clients || []).length > 0 ? (
            <div className="space-y-2">
              {stats.outstanding.clients.map(c => (
                <div
                  key={c._id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                  onClick={() => navigate(`/clients/${c._id}`)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-error/10 rounded-full flex items-center justify-center text-xs text-error font-semibold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      {c.phase === 'post_expiry' && (
                        <p className="text-xs text-warning font-mono">{c.daysPostExpiry}d post-expiry</p>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-sm text-error font-semibold">
                    −{formatKES(Math.abs(c.balance))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-base-content/30 text-sm">
              🎉 No overdue accounts!
            </div>
          )}
        </div>

        {/* Recent alerts */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base">Recent Alerts</h3>
            <button onClick={() => navigate('/alerts')} className="btn btn-xs btn-ghost text-primary">
              View all →
            </button>
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map(a => (
                <div
                  key={a._id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer
                    ${!a.isRead ? 'bg-base-200' : 'hover:bg-base-200'}
                  `}
                  onClick={() => navigate('/alerts')}
                >
                  <span className="text-base mt-0.5">{getAlertTypeIcon(a.alertType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-base-content/60 mb-0.5">{a.client?.name}</p>
                    <p className="text-sm leading-snug line-clamp-2">{a.message}</p>
                    <p className="text-xs text-base-content/30 mt-1 font-mono">{timeAgo(a.createdAt)}</p>
                  </div>
                  <span className={`badge badge-xs mt-1
                    ${a.severity === 'critical' ? 'badge-error' : a.severity === 'warning' ? 'badge-warning' : 'badge-info'}
                  `} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-base-content/30 text-sm">
              No alerts at this time
            </div>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="text-xs text-base-content/50 uppercase tracking-wider">
                <th className="font-semibold">Client</th>
                <th className="font-semibold">Amount</th>
                <th className="font-semibold">Type</th>
                <th className="font-semibold">Paid By</th>
                <th className="font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentPayments || []).map(p => (
                <tr
                  key={p._id}
                  className="table-row-hover"
                  onClick={() => navigate(`/clients/${p.client?._id}`)}
                >
                  <td className="font-medium">{p.client?.name || '—'}</td>
                  <td className={`font-mono font-semibold ${p.amount < 0 ? 'text-warning' : 'text-success'}`}>
                    {p.amount < 0 ? '−' : '+'}{formatKES(Math.abs(p.amount))}
                  </td>
                  <td>
                    <span className="badge badge-ghost badge-xs capitalize">
                      {p.paymentType?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-base-content/60 text-xs">{p.paidBy || '—'}</td>
                  <td className="text-base-content/60 text-xs font-mono">{formatDate(p.paymentDate)}</td>
                </tr>
              ))}
              {!stats?.recentPayments?.length && (
                <tr><td colSpan={5} className="text-center text-base-content/30 py-6">No payments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
