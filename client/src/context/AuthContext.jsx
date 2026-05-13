import { createContext, useContext, useState, useEffect, useRef } from 'react'
import apiClient from '../utils/api'

const AuthContext = createContext(null)

const demoUser = {
  _id: 'demo_user',
  name: 'Demo User',
  email: 'demo@carefacility.com',
  role: 'admin'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initAuth = async () => {
      const demoMode = sessionStorage.getItem('demoMode') === 'true'

      if (demoMode) {
        setIsDemoMode(true)
        setUser(demoUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem('accessToken')

      if (!token || token === 'undefined' || token === 'null') {
        setIsLoading(false)
        return
      }

      try {
        const res = await apiClient.get('/auth/me')

        if (res && res.status === 200) {
          const data = res.data
          const userData = data?.data?.user
            ?? data?.data
            ?? data?.user
            ?? data
          setUser(userData)
          setIsAuthenticated(true)
          setIsDemoMode(false)
        } else if (res?.status === 401) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setIsAuthenticated(false)
          setUser(null)
          setIsDemoMode(false)
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

  const loginDemo = () => {
    sessionStorage.setItem('demoMode', 'true')
    setUser(demoUser)
    setIsAuthenticated(true)
    setIsDemoMode(true)
    setIsLoading(false)
    return { success: true }
  }

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password })

      const data = res.data

      if (!res || res.status !== 200) {
        return { success: false, message: data?.message ?? 'Login failed' }
      }

      const tokenData = data?.data
      if (!tokenData?.accessToken) {
        console.error('[LOGIN] unexpected response shape:', data)
        return { success: false, message: 'Invalid server response' }
      }

      sessionStorage.removeItem('demoMode')
      setIsDemoMode(false)

      localStorage.setItem('accessToken', tokenData.accessToken)
      localStorage.setItem('refreshToken', tokenData.refreshToken ?? '')

      setUser(tokenData.user)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      console.error('[LOGIN] network error:', err)
      const message = err.response?.data?.message || err.message || 'Network error. Try again.'
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('demoMode')
    setUser(null)
    setIsAuthenticated(false)
    setIsDemoMode(false)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isDemoMode,
        isLoading,
        login,
        loginDemo,
        logout
      }}
    >
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

