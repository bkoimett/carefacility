import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  Bell, 
  Settings,
  Menu,
  X
} from 'lucide-react'
import { alertsApi } from '../../utils/api'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/sponsors', label: 'Sponsors', icon: Building2 },
  // { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

export default function Layout() {
  const location = useLocation()
  const [alertCount, setAlertCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await alertsApi.getAll({ isRead: false, limit: 1 })
        setAlertCount(res.data.unreadCount || 0)
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (to) => location.pathname === to

  const pageTitle = navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'

  return (
    <div className="flex min-h-screen bg-[#070D19]">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0B1426] border-r border-[#1A263D] flex-col h-screen sticky top-0 p-6">
        {/* Logo Area */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#0891B2] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-[#F0F4FF] font-semibold text-base">TSP</h1>
              <p className="text-[#3D4F6B] text-xs tracking-widest uppercase mt-0.5">Billing Suite</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item.to)
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm transition-all duration-200 cursor-pointer ${
                  active
                    ? 'text-[#06B6D4] bg-[rgba(6,182,212,0.08)] border-l-2 border-[#06B6D4] font-medium'
                    : 'text-[#6B7FA3] hover:text-[#F0F4FF] hover:bg-[#1A263D]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? 'text-[#06B6D4]' : 'text-[#3D4F6B]'
                  }`}
                />
                <span>{item.label}</span>
                {item.label === 'Alerts' && alertCount > 0 && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[#1A263D] pt-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A263D] to-[#0B1426] ring-1 ring-[#1A263D] flex items-center justify-center">
              <span className="text-[#06B6D4] text-xs font-bold">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F0F4FF] text-sm font-medium truncate">John Doe</p>
              <p className="text-[#3D4F6B] text-xs truncate">Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 mt-3 rounded-[8px] cursor-pointer hover:bg-[#1A263D] transition-colors" onClick={() => setSidebarOpen(false)}>
            <Settings className="w-4 h-4 text-[#3D4F6B]" />
            <span className="text-sm text-[#6B7FA3]">Settings</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#0B1426] border-r border-[#1A263D] z-50 flex-col p-6 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden flex`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 w-8 h-8 text-[#6B7FA3] hover:text-[#F0F4FF] flex items-center justify-center"
          onClick={() => setSidebarOpen(false)}
        >
          <X width={16} height={16} />
        </button>

        {/* Logo Area */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#0891B2] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-[#F0F4FF] font-semibold text-base">TSP</h1>
              <p className="text-[#3D4F6B] text-xs tracking-widest uppercase mt-0.5">Billing Suite</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item.to)
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm transition-all duration-200 cursor-pointer ${
                  active
                    ? 'text-[#06B6D4] bg-[rgba(6,182,212,0.08)] border-l-2 border-[#06B6D4] font-medium'
                    : 'text-[#6B7FA3] hover:text-[#F0F4FF] hover:bg-[#1A263D]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? 'text-[#06B6D4]' : 'text-[#3D4F6B]'
                  }`}
                />
                <span>{item.label}</span>
                {item.label === 'Alerts' && alertCount > 0 && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[#1A263D] pt-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A263D] to-[#0B1426] ring-1 ring-[#1A263D] flex items-center justify-center">
              <span className="text-[#06B6D4] text-xs font-bold">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F0F4FF] text-sm font-medium truncate">John Doe</p>
              <p className="text-[#3D4F6B] text-xs truncate">Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 mt-3 rounded-[8px] cursor-pointer hover:bg-[#1A263D] transition-colors" onClick={() => setSidebarOpen(false)}>
            <Settings className="w-4 h-4 text-[#3D4F6B]" />
            <span className="text-sm text-[#6B7FA3]">Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#0B1426] border-b border-[#1A263D] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <button
              className="lg:hidden w-9 h-9 rounded-[8px] flex items-center justify-center text-[#6B7FA3] hover:text-[#F0F4FF] hover:bg-[#1A263D] mr-3"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu width={16} height={16} />
            </button>
            <div>
              <h2 className="text-[#F0F4FF] text-xl font-semibold truncate max-w-[180px] sm:max-w-none">{pageTitle}</h2>
              <p className="text-[#3D4F6B] text-xs mt-0.5">
                {location.pathname === '/dashboard' && 'Overview of facility operations'}
                {location.pathname === '/clients' && 'Manage resident clients'}
                {location.pathname === '/sponsors' && 'Sponsors and funding sources'}
                {location.pathname === '/payments' && 'Payment tracking and ledgers'}
                {location.pathname === '/alerts' && 'System alerts and notifications'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex w-8 h-8 rounded-[6px] text-[#3D4F6B] hover:text-[#06B6D4] hover:bg-[#1A263D] transition-all flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            <button className="w-8 h-8 rounded-[6px] text-[#3D4F6B] hover:text-[#06B6D4] hover:bg-[#1A263D] transition-all flex items-center justify-center relative">
              <Bell width="16" height="16" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-[10px] font-mono text-white flex items-center justify-center">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </button>
            <div className="w-px h-5 bg-[#1A263D]"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A263D] to-[#0B1426] ring-1 ring-[#1A263D] flex items-center justify-center">
                <span className="text-[#06B6D4] text-xs font-bold">JD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
