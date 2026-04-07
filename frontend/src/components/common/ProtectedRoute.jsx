import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth()
  const needsAdmin = adminOnly || requireAdmin

  // ❌ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ❌ Not admin (if required)
  if (needsAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  // ✅ Allowed
  return children
}
