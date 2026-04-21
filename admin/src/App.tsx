import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/index'
import AppLayout from './components/layout/AppLayout'
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/AuthPages'
import { DashboardPage, FieldsPage, FieldDetailPage, AgentsPage, ProfilePage, SettingsPage } from './pages/AppPages'

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <>{children}</> : <Navigate to="/login" replace />
}
function Public({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login"           element={<Public><LoginPage/></Public>}/>
              <Route path="/register"        element={<Public><RegisterPage/></Public>}/>
              <Route path="/forgot-password" element={<Public><ForgotPasswordPage/></Public>}/>
              <Route path="/reset-password"  element={<ResetPasswordPage/>}/>
              <Route path="/verify-email"    element={<VerifyEmailPage/>}/>
              <Route path="/" element={<Guard><AppLayout/></Guard>}>
                <Route index                element={<Navigate to="/dashboard" replace/>}/>
                <Route path="dashboard"     element={<DashboardPage/>}/>
                <Route path="fields"        element={<FieldsPage/>}/>
                <Route path="fields/:id"    element={<FieldDetailPage/>}/>
                <Route path="agents"        element={<AgentsPage/>}/>
                <Route path="profile"       element={<ProfilePage/>}/>
                <Route path="settings"      element={<SettingsPage/>}/>
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
