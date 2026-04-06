import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth()

  // ❌ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ❌ Not admin (if required)
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  // ✅ Allowed
  return children
}