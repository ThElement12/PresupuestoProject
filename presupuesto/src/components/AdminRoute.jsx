import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { usuario } = useAuth();
  if (!usuario || usuario.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
