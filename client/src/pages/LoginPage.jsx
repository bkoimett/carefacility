import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const isSignupRoute = location.pathname === '/signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthLoading, isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('[LOGINPAGE] submit fired')

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.message ?? 'Invalid email or password')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#070D19]">
      {/* LEFT PANEL — brand (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1426] border-r border-[#1A263D] flex-col items-center justify-center p-12">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-[12px] bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center mb-6">
          <Building2 className="w-8 h-8 text-white" />
        </div>

        {/* App name */}
        <h1 className="text-[#F0F4FF] text-3xl font-['DM_Serif_Display'] mb-2">
          CareFacility
        </h1>
        <p className="text-[#6B7FA3] text-sm">
          Premium Care Facility Management
        </p>

        {/* Feature pills */}
        <div className="mt-16 space-y-4 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(6,182,212,0.08)] text-[#06B6D4] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-[#6B7FA3] text-sm">Client billing & payments</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(6,182,212,0.08)] text-[#06B6D4] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[#6B7FA3] text-sm">Automated debt tracking</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(6,182,212,0.08)] text-[#06B6D4] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-[#6B7FA3] text-sm">Sponsor management</span>
          </div>
        </div>

        {/* Subtle noise pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
             }}
        />
      </div>

      {/* RIGHT PANEL — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-[#F0F4FF] text-2xl font-semibold">
              {isSignupRoute ? 'Sign-up isn’t available yet' : 'Welcome back'}
            </h1>
            <p className="text-[#6B7FA3] text-sm mt-1">
              {isSignupRoute ? 'Use login for now and contact your administrator to create an account.' : 'Sign in to your account'}
            </p>
          </div>

          {/* Form card */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@carefacility.com"
                className="w-full bg-[#0B1426] border border-[#1A263D] rounded-[8px] px-4 py-3 text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[#0B1426] border border-[#1A263D] rounded-[8px] px-4 py-3 text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-[8px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-premium w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Footer */}
            {isSignupRoute ? (
              <div className="text-center">
                <Link
                  to="/"
                  className="text-[#06B6D4] text-sm font-medium hover:text-[#22D3EE] transition-colors"
                >
                  Back to login
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-[#6B7FA3] text-sm">Don&apos;t have an account? </span>
                <Link
                  to="/signup"
                  className="text-[#06B6D4] text-sm font-medium hover:text-[#22D3EE] transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            <p className="text-[#3D4F6B] text-xs text-center mt-6">
              Protected system — authorized personnel only
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
