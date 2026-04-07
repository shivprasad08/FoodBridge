
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PendingVerification from './pages/PendingVerification'
import Unauthorized from './pages/Unauthorized'
import ProviderDashboard from './pages/ProviderDashboard'
import RecipientDashboard from './pages/RecipientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NewListingToast from './components/NewListingToast'


const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <NewListingToast />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pending-verification" element={<PendingVerification />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Provider routes */}
            <Route path="/provider/*" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            } />

            {/* Recipient routes */}
            <Route path="/recipient/*" element={
              <ProtectedRoute allowedRoles={['recipient']}>
                <RecipientDashboard />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
