import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

     const initAuth = async () => {
      const token = localStorage.getItem('accessToken')

      if (!token || token === 'undefined' || token === 'null') {
        setIsLoading(false)
        return
      }

      try {
        // Use absolute URL in production, relative in development
        const apiBase = import.meta.env.VITE_API_URL || ''
        const res = await fetch(`${apiBase}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (res.ok) {
          const data = await res.json()
          const userData = data?.data?.user
            ?? data?.data
            ?? data?.user
            ?? data
          setUser(userData)
          setIsAuthenticated(true)
        } else if (res.status === 401) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setIsAuthenticated(false)
          setUser(null)
        }
        // 500 or other errors — keep user logged in, try again next load
      } catch (err) {
        console.error('[AUTH] init error:', err.message)
        // Network error — do NOT clear token
      } finally {
        setIsLoading(false)  // always, no conditions
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      // Use absolute URL in production, relative in development
      const apiBase = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, message: data.message ?? 'Login failed' }
      }

      const tokenData = data?.data
      if (!tokenData?.accessToken) {
        console.error('[LOGIN] unexpected response shape:', data)
        return { success: false, message: 'Invalid server response' }
      }

      localStorage.setItem('accessToken', tokenData.accessToken)
      localStorage.setItem('refreshToken', tokenData.refreshToken ?? '')

      setUser(tokenData.user)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      console.error('[LOGIN] network error:', err)
      return { success: false, message: err.message || 'Network error. Try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoading, login, logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext
