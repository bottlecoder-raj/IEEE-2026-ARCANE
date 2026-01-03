import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ProviderDashboard from './pages/ProviderDashboard'
import SeekerDashboard from './pages/SeekerDashboard'
import AddMaterial from './pages/AddMaterial'
import BrowseMaterials from './pages/BrowseMaterials'
import Requests from './pages/Requests'
import Analytics from './pages/Analytics'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return children
}

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes - Provider */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-material"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <AddMaterial />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Seeker */}
        <Route
          path="/seeker/dashboard"
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <SeekerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Both Roles */}
        <Route
          path="/materials"
          element={
            <ProtectedRoute allowedRoles={['provider', 'seeker']}>
              <BrowseMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute allowedRoles={['provider', 'seeker']}>
              <Requests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['provider', 'seeker']}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App

