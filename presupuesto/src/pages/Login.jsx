import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { WarningCircle } from '@phosphor-icons/react';
import { Button, Input, Card } from '../components/ui';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(correo, pass);
      login(data.token, data.usuario, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      if (
        err.errorCode === 'USER_NOT_FOUND' ||
        err.errorCode === 'INVALID_PASSWORD' ||
        err.status === 401
      ) {
        setError('Credenciales incorrectas');
      } else {
        setError(err.message || 'Error del servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-surface px-4">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-modal">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-primary tracking-tight">PresupuestoApp</h2>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Iniciar Sesión</h1>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-destructive-50 border border-destructive/20 text-destructive rounded-lg px-4 py-3 mb-4" role="alert">
            <WarningCircle size={20} weight="fill" className="shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 accent-primary rounded cursor-pointer"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600 cursor-pointer">
              Mantener la sesión iniciada
            </label>
          </div>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Entrar
          </Button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-5">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary hover:text-primary-700 font-medium transition-colors">
            Registrarse
          </Link>
        </p>
      </Card>
    </div>
  );
}
