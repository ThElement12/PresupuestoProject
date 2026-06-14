import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { usuario } = useAuth();
  if (usuario) return <Navigate to="/dashboard" replace />;
  return children;
}
