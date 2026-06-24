import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const PUBLIC_ROUTES = [
  { method: 'POST', path: '/login' },
  { method: 'POST', path: '/register' },
  { method: 'GET', path: '/config' },
  { method: 'GET', path: '/tipo-movimiento' },
];

export default function auth(req, res, next) {
  const isPublic = PUBLIC_ROUTES.some(
    (r) => req.method === r.method && req.path === r.path
  );
  if (isPublic) return next();

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado', errorCode: 'UNAUTHORIZED' });
  }

  try {
    const token = header.slice(7);
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado', errorCode: 'UNAUTHORIZED' });
  }
}

export { JWT_SECRET };
