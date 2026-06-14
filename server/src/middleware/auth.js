export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado', errorCode: 'UNAUTHORIZED' });
  }

  try {
    req.usuario = JSON.parse(header.slice(7));
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido', errorCode: 'UNAUTHORIZED' });
  }
}
