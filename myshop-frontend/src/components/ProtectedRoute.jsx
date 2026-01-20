import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  console.log('🔒 ProtectedRoute check - Token exists:', !!token);
  
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
