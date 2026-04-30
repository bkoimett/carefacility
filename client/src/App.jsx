import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/ui/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import SponsorsPage from './pages/SponsorsPage'
import AlertsPage from './pages/AlertsPage'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="clients" element={<ErrorBoundary><ClientsPage /></ErrorBoundary>} />
            <Route path="clients/:id" element={<ErrorBoundary><ClientDetailPage /></ErrorBoundary>} />
            <Route path="sponsors" element={<ErrorBoundary><SponsorsPage /></ErrorBoundary>} />
            <Route path="alerts" element={<ErrorBoundary><AlertsPage /></ErrorBoundary>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
