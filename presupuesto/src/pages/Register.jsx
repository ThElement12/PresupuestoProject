import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { WarningCircle, Check, X } from '@phosphor-icons/react';
import { Button, Input, Card } from '../components/ui';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (pass !== confirmPass) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await api.register(nombre, correo, pass);
      setSuccess('Usuario registrado exitosamente');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err.errorCode === 'USER_EXISTS' || err.errorCode === 'REGISTRATION_ERROR') {
        setError(err.message);
      } else {
        setError('Error del servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPass.length > 0 && pass === confirmPass;
  const passwordsMismatch = confirmPass.length > 0 && pass !== confirmPass;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-surface px-4">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-modal">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-primary tracking-tight">PresupuestoApp</h2>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Registrarse</h1>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-destructive-50 border border-destructive/20 text-destructive rounded-lg px-4 py-3 mb-4" role="alert">
            <WarningCircle size={20} weight="fill" className="shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-accent-50 border border-accent/20 text-accent rounded-lg px-4 py-3 mb-4" role="alert">
            <Check size={20} weight="bold" className="shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <div>
            <Input
              label="Confirmar Contraseña"
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              autoComplete="new-password"
            />
            {passwordsMatch && (
              <p className="flex items-center gap-1 text-accent-500 text-sm mt-1.5">
                <Check size={14} weight="bold" /> Las contraseñas coinciden
              </p>
            )}
            {passwordsMismatch && (
              <p className="flex items-center gap-1 text-destructive text-sm mt-1.5">
                <X size={14} weight="bold" /> Las contraseñas no coinciden
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
            disabled={confirmPass.length === 0 || pass !== confirmPass}
          >
            Registrarse
          </Button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary hover:text-primary-700 font-medium transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
