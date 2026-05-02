import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { dashboardApi, alertsApi } from '../utils/api'
import { formatKES, formatDate, getAlertTypeIcon, timeAgo } from '../utils/formatters'
import { StatCard, Spinner, ErrorState, PageHeader } from '../components/ui'
import { DashboardSkeleton } from '../components/SkeletonLoader'
import RevenueDetails from '../components/RevenueDetails'
import DebtDetails from '../components/DebtDetails'
import { Users, TrendingUp, AlertTriangle, Bell } from 'lucide-react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [trendData, setTrendData] = useState([])
  const [revenueModalOpen, setRevenueModalOpen] = useState(false)
  const [debtModalOpen, setDebtModalOpen] = useState(false)

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

        if (statsRes.data.data?.revenueTrend) {
          setTrendData(statsRes.data.data.revenueTrend.map(d => ({
            name: `${MONTHS[d._id.month - 1]} ${d._id.year}`,
            revenue: d.total,
            payments: d.count
          })))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const totalAlerts = (stats?.alerts?.critical || 0) + (stats?.alerts?.warning || 0) + (stats?.alerts?.info || 0)

  return (
     <div className="p-4 sm:p-6 lg:p-8">
       {loading ? (
         <DashboardSkeleton />
       ) : (
         <>
           {/* Page Header - shown on all screens */}
           <div className="mb-6 lg:mb-8">
             <div className="flex items-center gap-2">
               <h2 className="text-xl lg:text-2xl font-semibold text-[#F0F4FF] font-['DM_Serif_Display']">Dashboard</h2>
             </div>
             <p className="text-[#3D4F6B] text-sm mt-1 ml-0">Overview of facility operations</p>
           </div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Active Clients */}
            <div className="card-premium p-6 relative overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 bg-[#06B6D4]"></div>
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[#6B7FA3] text-xs font-medium tracking-widest uppercase mb-3">Active Clients</p>
                   <p className="text-[#F0F4FF] text-2xl lg:text-3xl font-bold font-['DM_Serif_Display'] tracking-tight">{stats?.clients?.active ?? 0}</p>
                  <p className="text-[#3D4F6B] text-xs mt-1.5">{stats?.clients?.total ?? 0} total clients</p>
                </div>
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[rgba(6,182,212,0.1)] text-[#06B6D4]">
                  <Users size={20} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#1A263D]">
                <p className="text-[#3D4F6B] text-xs">Live occupancy tracking</p>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div
              className="card-premium p-6 relative overflow-hidden hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer"
              onClick={() => setRevenueModalOpen(true)}
            >
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 bg-[#F59E0B]"></div>
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[#6B7FA3] text-xs font-medium tracking-widest uppercase mb-3">Monthly Revenue</p>
                   <p className="text-[#F0F4FF] text-2xl lg:text-3xl font-bold font-['DM_Serif_Display'] tracking-tight">KES {new Intl.NumberFormat().format(stats?.revenue?.thisMonth || 0)}</p>
                  <p className="text-[#3D4F6B] text-xs mt-1.5">KES {new Intl.NumberFormat().format(stats?.revenue?.total || 0)} all time</p>
                </div>
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[#F59E0B]">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#1A263D]">
                <p className="text-[#3D4F6B] text-xs">{stats?.revenue?.thisMonth > stats?.revenue?.lastMonth ? '↑ Growing' : '→ On track'}</p>
              </div>
            </div>

            {/* Outstanding Debt */}
            <div
              className="card-premium p-6 relative overflow-hidden hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer"
              onClick={() => setDebtModalOpen(true)}
            >
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 bg-[#EF4444]"></div>
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[#6B7FA3] text-xs font-medium tracking-widest uppercase mb-3">Outstanding Debt</p>
                   <p className="text-[#F0F4FF] text-2xl lg:text-3xl font-bold font-['DM_Serif_Display'] tracking-tight">KES {new Intl.NumberFormat().format(stats?.outstanding?.total || 0)}</p>
                  <p className="text-[#3D4F6B] text-xs mt-1.5">{(stats?.outstanding?.clients || []).length} clients overdue</p>
                </div>
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[rgba(239,68,68,0.1)] text-[#EF4444]">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#1A263D]">
                <p className="text-[#3D4F6B] text-xs">Avg: KES {new Intl.NumberFormat().format(((stats?.outstanding?.clients || []).reduce((s, c) => s + Math.abs(c.balance), 0) / ((stats?.outstanding?.clients || []).length || 1)) || 0)} / client</p>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="card-premium p-6 relative overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 bg-[#F59E0B]"></div>
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[#6B7FA3] text-xs font-medium tracking-widest uppercase mb-3">Active Alerts</p>
                   <p className="text-[#F0F4FF] text-2xl lg:text-3xl font-bold font-['DM_Serif_Display'] tracking-tight">{totalAlerts}</p>
                  <p className="text-[#3D4F6B] text-xs mt-1.5">{stats?.alerts?.critical || 0} critical</p>
                </div>
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[#F59E0B]">
                  <Bell size={20} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#1A263D]">
                <p className="text-[#3D4F6B] text-xs">{stats?.alerts?.warning || 0} warnings • {stats?.alerts?.info || 0} info</p>
              </div>
            </div>
          </div>

           {/* Charts Row */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-8">
             {/* Revenue Chart */}
             <div className="card-premium p-6 col-span-1 lg:col-span-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#F0F4FF] font-semibold text-base">Revenue Trend (6 months)</h3>
                <span className="text-[#06B6D4] bg-[rgba(6,182,212,0.08)] text-xs px-3 py-1 rounded-full">Last 6 months</span>
              </div>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgba(245,158,11,0.2)" stopOpacity={1} />
                        <stop offset="95%" stopColor="rgba(245,158,11,0)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A263D" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#6B7FA3', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B7FA3', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#0B1426', border: '1px solid #1A263D', borderRadius: '8px', color: '#F0F4FF', fontSize: '12px' }}
                      formatter={(v) => [`KES ${new Intl.NumberFormat().format(v)}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} fill="url(#revenueGradient)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-[#3D4F6B] text-sm">
                  No payment data yet
                </div>
              )}
            </div>

             {/* Recent Alerts */}
             <div className="card-premium p-6 col-span-1 lg:col-span-4 mt-4 lg:mt-0">
              <h3 className="text-[#F0F4FF] font-semibold text-base mb-5">Recent Alerts</h3>
              <div className="space-y-1">
                {alerts.length > 0 ? (
                  alerts.map(a => (
                    <div key={a._id} className="flex items-start gap-3 py-3 border-b border-[#1A263D] last:border-0">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        a.severity === 'critical' ? 'bg-[#EF4444]' : a.severity === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#06B6D4]'
                      }`}></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F0F4FF] text-sm font-medium leading-snug">{a.message}</p>
                        <p className="text-[#3D4F6B] text-xs mt-0.5">{a.client?.name || 'System'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#3D4F6B] text-sm py-4">No alerts at this time</p>
                )}
              </div>
            </div>
          </div>

           {/* Bottom Row */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
             {/* Top Debtors */}
             <div className="card-premium p-6 col-span-1 lg:col-span-5">
              <h3 className="text-[#F0F4FF] font-semibold text-base mb-5">Most Overdue Clients</h3>
              {(stats?.outstanding?.clients || []).length > 0 ? (
                <div className="space-y-1">
                  {stats.outstanding.clients.map((c, i) => (
                    <div key={c._id} className="flex items-center gap-4 py-2.5">
                      <span className="text-[#1A263D] text-2xl font-bold font-['DM_Serif_Display'] w-8">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F0F4FF] text-sm font-medium truncate">{c.name}</p>
                        <p className="text-[#3D4F6B] text-xs truncate">{c.phase === 'post_expiry' ? `${c.daysPostExpiry}d post-expiry` : 'Active client'}</p>
                      </div>
                      <span className="text-[#EF4444] font-semibold text-sm font-mono">KES {new Intl.NumberFormat().format(Math.abs(c.balance))}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#3D4F6B] text-sm py-4 text-center">🎉 No overdue accounts!</p>
              )}
            </div>

             {/* Recent Payments Table */}
             <div className="card-premium p-6 col-span-1 lg:col-span-7 mt-4 lg:mt-0">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[#F0F4FF] font-semibold text-base">Recent Payments</h3>
                <button onClick={() => navigate('/payments')} className="text-[#06B6D4] text-xs hover:underline">View all</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1A263D]">
                    <th className="text-[#3D4F6B] text-xs font-medium tracking-wider uppercase pb-3 text-left">Client</th>
                    <th className="text-[#3D4F6B] text-xs font-medium tracking-wider uppercase pb-3 text-left">Amount</th>
                    <th className="text-[#3D4F6B] text-xs font-medium tracking-wider uppercase pb-3 text-left">Type</th>
                    <th className="text-[#3D4F6B] text-xs font-medium tracking-wider uppercase pb-3 text-left">Paid By</th>
                    <th className="text-[#3D4F6B] text-xs font-medium tracking-wider uppercase pb-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentPayments || []).map(p => (
                    <tr key={p._id} className="border-b border-[#1A263D] hover:bg-[#1A263D]/40 transition-colors cursor-pointer" onClick={() => navigate(`/clients/${p.client?._id}`)}>
                      <td className="py-3.5 text-[#F0F4FF] text-sm font-medium">{p.client?.name || '—'}</td>
                      <td className="py-3.5 text-[#10B981] text-sm font-semibold font-mono">KES {new Intl.NumberFormat().format(Math.abs(p.amount))}</td>
                      <td className="py-3.5 text-[#6B7FA3] text-sm">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#1A263D]">{p.paymentType?.replace(/_/g, ' ') || 'Payment'}</span>
                      </td>
                      <td className="py-3.5 text-[#6B7FA3] text-xs">{p.paidBy || '—'}</td>
                      <td className="py-3.5 text-[#6B7FA3] text-xs font-mono">{formatDate(p.paymentDate)}</td>
                    </tr>
                  ))}
                  {!stats?.recentPayments?.length && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#3D4F6B] text-sm">No payments yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <RevenueDetails isOpen={revenueModalOpen} onClose={() => setRevenueModalOpen(false)} />
      <DebtDetails isOpen={debtModalOpen} onClose={() => setDebtModalOpen(false)} />
    </div>
  )
}