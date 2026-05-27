import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                PresupuestoApp
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/mes/nuevo" className="text-gray-600 hover:text-gray-900">
                Nuevo Mes
              </Link>
              <Link to="/metodos" className="text-gray-600 hover:text-gray-900">
                Métodos
              </Link>
              {usuario?.rol === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                  Admin
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{usuario?.nombre}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
