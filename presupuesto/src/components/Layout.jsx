import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { List, X, SignOut } from '@phosphor-icons/react';
import { Button } from './ui';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/mes/nuevo', label: 'Nuevo Mes' },
  { to: '/metodos', label: 'Formas de Pago' },
  { to: '/ayuda', label: 'Ayuda' },
];

function NavLink({ to, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative py-1 text-sm font-medium transition-colors duration-150
        ${active
          ? 'text-primary'
          : 'text-gray-500 hover:text-gray-800'
        }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-[19px] left-0 right-0 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );
}

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const allLinks = [
    ...navLinks,
    ...(usuario?.rol === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface-card/95 backdrop-blur-sm shadow-card border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-10">
              <Link to="/dashboard" className="text-xl font-bold text-primary tracking-tight">
                PresupuestoApp
              </Link>
              <div className="hidden md:flex items-center gap-6">
                {allLinks.map((link) => (
                  <NavLink key={link.to} {...link} active={isActive(link.to)} />
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="bg-primary-50 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {usuario?.nombre}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-destructive">
                <SignOut size={18} />
                <span className="hidden lg:inline">Cerrar sesión</span>
              </Button>
            </div>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[#DBEAFE] px-4 pt-3 pb-4 space-y-1 animate-slide-up bg-surface-card">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive(link.to)
                    ? 'text-primary bg-primary-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#DBEAFE] pt-3 mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">{usuario?.nombre}</span>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <SignOut size={16} />
                Cerrar sesión
              </Button>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
