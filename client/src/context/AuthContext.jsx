import { createContext, useContext, useState, useEffect, useRef } from 'react'
import apiClient from '../utils/api'

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
        const res = await apiClient.get('/auth/me')

        if (res && res.status === 200) {
          const data = res.data
          const userData = data?.data?.user
            ?? data?.data
            ?? data?.user
            ?? data
          setUser(userData)
          setIsAuthenticated(true)
        } else if (res?.status === 401) {
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
     setUser(null)
     setIsAuthenticated(false)
     window.location.href = '/login'
   }

   const updateProfile = async (profileData) => {
     try {
       const response = await apiClient.patch('/auth/profile', profileData)
       setUser(response.data.user)
       return { success: true, user: response.data.user }
     } catch (error) {
       return { success: false, error: error.response?.data?.message || 'Update failed' }
     }
   }

   const changePassword = async (passwordData) => {
     try {
       await apiClient.patch('/auth/change-password', passwordData)
       return { success: true, message: 'Password changed successfully' }
     } catch (error) {
       return { success: false, error: error.response?.data?.message || 'Password change failed' }
     }
   }

   const getAllUsers = async () => {
     try {
       const response = await apiClient.get('/auth/users')
       return response.data
     } catch (error) {
       console.error('Failed to fetch users:', error)
       return []
     }
   }

   const createUser = async (userData) => {
     try {
       const response = await apiClient.post('/auth/users', userData)
       return { success: true, user: response.data.user }
     } catch (error) {
       return { success: false, error: error.response?.data?.message || 'User creation failed' }
     }
   }

   const updateUser = async (userId, userData) => {
     try {
       const response = await apiClient.put(`/auth/users/${userId}`, userData)
       return { success: true, user: response.data.user }
     } catch (error) {
       return { success: false, error: error.response?.data?.message || 'User update failed' }
     }
   }

   const deleteUser = async (userId) => {
     try {
       await apiClient.delete(`/auth/users/${userId}`)
       return { success: true }
     } catch (error) {
       return { success: false, error: error.response?.data?.message || 'User deletion failed' }
     }
   }

   return (
     <AuthContext.Provider value={{
       user, isAuthenticated, isLoading, login, logout,
       updateProfile, changePassword,
       getAllUsers, createUser, updateUser, deleteUser
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
