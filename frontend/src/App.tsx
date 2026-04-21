import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/index'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/AuthPages'
import { DashboardPage, FieldsPage, FieldDetailPage, ProfilePage, SettingsPage } from './pages/AppPages'

// If logged in, redirect to dashboard. Otherwise show the requested page.
function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// If logged in, redirect away from auth pages.
function Public({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />
}

// Root: show landing if not logged in, redirect to dashboard if logged in.
function Root() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing — smart root */}
              <Route path="/" element={<Root />} />

              {/* Public auth routes — redirect to /dashboard if already logged in */}
              <Route path="/login"           element={<Public><LoginPage /></Public>} />
              <Route path="/register"        element={<Public><RegisterPage /></Public>} />
              <Route path="/forgot-password" element={<Public><ForgotPasswordPage /></Public>} />
              <Route path="/reset-password"  element={<ResetPasswordPage />} />
              <Route path="/verify-email"    element={<VerifyEmailPage />} />

              {/* Protected agent app — all under /app layout */}
              <Route element={<Guard><AppLayout /></Guard>}>
                <Route path="/dashboard"     element={<DashboardPage />} />
                <Route path="/fields"        element={<FieldsPage />} />
                <Route path="/fields/:id"    element={<FieldDetailPage />} />
                <Route path="/profile"       element={<ProfilePage />} />
                <Route path="/settings"      element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
