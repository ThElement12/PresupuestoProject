import db from '../database.js';
import AppError from './AppError.js';

const QUERIES = {
  usuario: null,
  mes: 'SELECT usuario_id FROM Mes WHERE id = ?',
  periodo: 'SELECT m.usuario_id FROM Periodo p JOIN Mes m ON p.mes_id = m.id WHERE p.id = ?',
  movimiento: 'SELECT m.usuario_id FROM Movimiento mv JOIN Periodo p ON mv.periodo_id = p.id JOIN Mes m ON p.mes_id = m.id WHERE mv.id = ?',
  transaccion: 'SELECT m.usuario_id FROM TransaccionEfectivo te JOIN Periodo p ON te.periodo_id = p.id JOIN Mes m ON p.mes_id = m.id WHERE te.id = ?',
  metodo: 'SELECT usuario_id FROM Metodo WHERE id = ?',
};

export default async function verifyOwnership(resourceType, resourceId, userId) {
  if (resourceType === 'usuario') {
    if (parseInt(resourceId) !== userId) {
      throw new AppError(403, 'No tienes permiso para acceder a este recurso', 'FORBIDDEN');
    }
    return;
  }

  const query = QUERIES[resourceType];
  if (!query) {
    throw new AppError(500, `Tipo de recurso desconocido: ${resourceType}`, 'INTERNAL_ERROR');
  }

  const [rows] = await db.query(query, [resourceId]);
  if (rows.length === 0) {
    throw new AppError(404, 'Recurso no encontrado', 'NOT_FOUND');
  }
  if (rows[0].usuario_id !== userId) {
    throw new AppError(403, 'No tienes permiso para acceder a este recurso', 'FORBIDDEN');
  }
}
