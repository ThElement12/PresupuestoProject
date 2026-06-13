import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center md:space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                PresupuestoApp
              </Link>
              <div className="hidden md:flex items-center space-x-8">
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
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-600">{usuario?.nombre}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                Cerrar sesión
              </button>
            </div>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              to="/mes/nuevo"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-600 hover:text-gray-900"
            >
              Nuevo Mes
            </Link>
            <Link
              to="/metodos"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-600 hover:text-gray-900"
            >
              Métodos
            </Link>
            {usuario?.rol === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-gray-900"
              >
                Admin
              </Link>
            )}
            <div className="border-t border-gray-200 pt-3 mt-2 flex items-center justify-between">
              <span className="text-gray-600">{usuario?.nombre}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
