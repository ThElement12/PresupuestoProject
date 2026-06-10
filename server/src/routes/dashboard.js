import express from "express";
import db from "../database.js";

const router = express.Router();

async function totalEnRD(monto_usd, monto_rd) {
  const [[{ valor }]] = await db.query("SELECT valor FROM Configuracion WHERE clave = 'tasa_dolar'");
  const tasa = parseFloat(valor) || 0;
  return parseFloat(monto_rd) + parseFloat(monto_usd) * tasa;
}

router.get('/dashboard/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const [meses] = await db.query(
      'SELECT * FROM Mes WHERE usuario_id = ? ORDER BY id DESC LIMIT 1',
      [usuario_id]
    );

    if (meses.length === 0) {
      return res.json({ mes: null, periodos: [], resumen: { totalIngresos: 0, totalGastos: 0, balance: 0 } });
    }

    const mes = meses[0];

    const [periodos] = await db.query(
      'SELECT * FROM Periodo WHERE mes_id = ? ORDER BY fecha_inicio ASC',
      [mes.id]
    );

    const periodosConMovimientos = [];
    let totalIngresos = 0;
    let totalGastos = 0;
    const gastosPorMetodo = {};

    for (const periodo of periodos) {
      const [movimientos] = await db.query(
        `SELECT m.*, tm.movimiento AS tipo, mt.metodo_pago, mt.es_efectivo
         FROM Movimiento m
         JOIN TipoMovimiento tm ON m.tipoMovimiento_id = tm.id
         LEFT JOIN Metodo mt ON m.metodo_id = mt.id
         WHERE m.Periodo_id = ?`,
        [periodo.id]
      );

      let ingresos = 0;
      let gastos = 0;
      const movsEnriquecidos = [];

      for (const mov of movimientos) {
        const total = await totalEnRD(mov.monto_usd, mov.monto_rd);
        const esIngreso = mov.tipo === 'Ingreso';

        if (esIngreso) {
          ingresos += total;
        } else {
          gastos += total;
          const key = mov.metodo_id;
          if (!gastosPorMetodo[key]) {
            gastosPorMetodo[key] = {
              metodo_id: mov.metodo_id,
              metodo_pago: mov.metodo_pago,
              es_efectivo: mov.es_efectivo,
              total: 0,
            };
          }
          gastosPorMetodo[key].total += total;
        }

        movsEnriquecidos.push({ ...mov, totalRD: total });
      }

      totalIngresos += ingresos;
      totalGastos += gastos;

      periodosConMovimientos.push({
        ...periodo,
        movimientos: movsEnriquecidos,
        ingresos,
        gastos,
      });
    }

    const porMetodo = Object.values(gastosPorMetodo).map((m) => ({
      ...m,
      porcentaje: totalGastos > 0 ? (m.total / totalGastos) * 100 : 0,
    }));

    const efectivo = porMetodo.find((m) => m.es_efectivo);
    const efectivoRestante = efectivo
      ? totalIngresos - (totalGastos - efectivo.total)
      : totalIngresos - totalGastos;

    res.json({
      mes,
      periodos: periodosConMovimientos,
      resumen: {
        totalIngresos,
        totalGastos,
        balance: totalIngresos - totalGastos,
      },
      porMetodo,
      efectivoRestante,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener el dashboard' });
  }
});

export default router;
