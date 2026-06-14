export default function admin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren permisos de administrador', errorCode: 'FORBIDDEN' });
  }
  next();
}
