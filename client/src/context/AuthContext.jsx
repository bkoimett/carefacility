import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../utils/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const login = useCallback(async (email, password) => {
    try {
      const response = await authApi.login({ email, password })
      const { user, accessToken, refreshToken } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)
      setIsAuthenticated(true)
      return true
    } catch (err) {
      console.error('Login failed:', err)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/login'
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await authApi.getMe()
        setUser(response.data.data.user)
        setIsAuthenticated(true)
      } catch (err) {
        console.error('Auth check failed:', err)
        logout()
        return
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
