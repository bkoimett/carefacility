import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/ui/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import SponsorsPage from './pages/SponsorsPage'
import AlertsPage from './pages/AlertsPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<LoginPage />} />

               {/* Protected routes */}
               <Route element={<ProtectedRoute />}>
                 <Route element={<Layout />}>
                   <Route path="/" element={<Navigate to="/dashboard" replace />} />
                   <Route path="dashboard" element={<Dashboard />} />
                   <Route path="clients" element={<ClientsPage />} />
                   <Route path="clients/:id" element={<ClientDetailPage />} />
                   <Route path="sponsors" element={<SponsorsPage />} />
                   <Route path="alerts" element={<AlertsPage />} />
                   <Route path="settings" element={<SettingsPage />} />
                 </Route>
               </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
