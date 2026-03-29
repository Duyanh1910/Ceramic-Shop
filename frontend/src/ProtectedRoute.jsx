import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const isActive = localStorage.getItem('session_active') === 'true';
  const userRole = localStorage.getItem('role');

  if (!isActive) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; 
  }

  return children;
}