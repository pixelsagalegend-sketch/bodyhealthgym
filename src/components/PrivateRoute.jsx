import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children, requiredRoles }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gym-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gym-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredRoles && profile && !requiredRoles.includes(profile.role)) {
    return <Navigate to="/admin/clientes" replace />
  }

  return children
}
