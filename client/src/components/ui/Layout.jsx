import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { alertsApi } from '../../utils/api'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/clients', label: 'Clients', icon: '👤' },
  { to: '/sponsors', label: 'Sponsors', icon: '🤝' },
  { to: '/alerts', label: 'Alerts', icon: '🔔' },
]

export default function Layout() {
  const { theme, toggleTheme, isDark } = useTheme()
  const [unread, setUnread] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await alertsApi.getAll({ isRead: false, limit: 1 })
        setUnread(res.data.unreadCount || 0)
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-base-200 flex font-body">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-base-100 border-r border-base-300 z-30
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-content font-display text-lg">
              C
            </div>
            <div>
              <h1 className="font-display text-lg leading-tight text-base-content">CareTrack</h1>
              <p className="text-xs text-base-content/50 font-body">Fee Management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Alerts' && unread > 0 && (
                <span className="ml-auto badge badge-error badge-xs text-[10px] font-mono">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-base-300 space-y-2">
          <label className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-base-200 transition-colors">
            <span className="text-sm text-base-content/70">
              {isDark ? '☀️ Light mode' : '🌙 Dark mode'}
            </span>
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary ml-auto"
              checked={isDark}
              onChange={toggleTheme}
            />
          </label>
          <div className="px-3 py-2 text-xs text-base-content/30 font-mono">
            v1.0.0 · CareTrack
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-base-100 border-b border-base-300 flex items-center px-4 gap-3 sticky top-0 z-10">
          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1" />
          <NavLink to="/alerts" className="btn btn-ghost btn-sm relative">
            🔔
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 badge badge-error badge-xs text-[9px]">
                {unread}
              </span>
            )}
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
