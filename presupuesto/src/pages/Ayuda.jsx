import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { Card, CardTitle } from '../components/ui';

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#DBEAFE] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left cursor-pointer group"
      >
        <span className="font-medium text-gray-800 text-sm group-hover:text-primary transition-colors">{q}</span>
        <CaretDown
          size={16}
          className={`text-gray-400 shrink-0 ml-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-40 pb-3' : 'max-h-0'}`}
      >
        <p className="text-sm text-gray-500">{a}</p>
      </div>
    </div>
  );
}

export default function Ayuda() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Ayuda</h1>
        <p className="text-gray-500 text-sm">Todo lo que necesitas saber para usar la app desde cero.</p>
      </div>

      <Card>
        <CardTitle className="mb-4">Flujo básico</CardTitle>
        <ol className="space-y-4">
          {[
            { n: '1', title: 'Crea tus formas de pago', desc: 'Ve a "Formas de Pago" y agrega las tarjetas, cuentas o billeteras que usas. La opción "Efectivo" ya viene creada y no se puede borrar.' },
            { n: '2', title: 'Crea un ciclo de presupuesto', desc: 'Ve a "Nuevo Mes" y define las fechas del ciclo, cómo quieres dividirlo (mensual, quincenal o semanal) y qué porcentaje de tus ingresos va a cada categoría.' },
            { n: '3', title: 'Confirma tu efectivo inicial', desc: 'Al abrir el Dashboard, la app te pedirá cuánto efectivo tienes en mano al inicio del periodo. Ingresa la cantidad o coloca 0 si no manejas efectivo.' },
            { n: '4', title: 'Registra tus movimientos', desc: 'Usa "Agregar Movimiento" para registrar ingresos y gastos. Indica la forma de pago que usaste y si el gasto se repite cada mes.' },
            { n: '5', title: 'Marca los gastos como pagados', desc: 'Los gastos tienen una casilla de verificación. Márcalos como pagados cuando hayas efectuado el pago para mantener tu registro al día.' },
            { n: '6', title: 'Registra depósitos y retiros de efectivo', desc: 'Si sacas dinero del banco al bolsillo (retiro) o depositas efectivo del bolsillo al banco (depósito), regístralo en la sección "Depósitos y Retiros".' },
            { n: '7', title: 'Al terminar el mes, crea un nuevo ciclo', desc: 'Los gastos que marcaste como "¿Se repite cada mes?" se copiarán automáticamente al nuevo ciclo con estado pendiente.' },
          ].map(({ n, title, desc }) => (
            <li key={n} className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                {n}
              </span>
              <div>
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <CardTitle className="mb-4">Conceptos clave</CardTitle>
        <div className="space-y-5">
          {[
            { term: 'Ciclo de presupuesto (Mes)', def: 'Es el período de tiempo que quieres controlar, por ejemplo del 1 al 31 de junio. No tiene que ser un mes calendario exacto — tú defines las fechas.' },
            { term: 'Periodo', def: 'Una subdivisión del ciclo. Si elegiste "Mensual", tendrás un solo periodo. Si elegiste "Quincenal", tendrás dos periodos.' },
            { term: 'Frecuencia del ciclo', def: 'Define en cuántas partes se divide el ciclo: Mensual (1), Quincenal (2) o Semanal (4–5).' },
            { term: 'Efectivo en mano', def: 'El dinero físico que tienes. La app lo rastrea por separado del dinero en tarjeta o cuenta bancaria.' },
            { term: 'Forma de pago', def: 'El instrumento que usas para pagar: efectivo, tarjeta de crédito, cuenta de banco, PayPal, etc.' },
            { term: 'Gastos Esenciales', def: 'El porcentaje de tus ingresos para necesidades fijas: alquiler, luz, cuotas de préstamos, etc.' },
            { term: 'Gastos Variables', def: 'El porcentaje para gastos no esenciales: comer fuera, entretenimiento, ropa, caprichos.' },
            { term: '¿Se repite cada mes?', def: 'Si marcas esta casilla, la app lo copiará automáticamente al siguiente ciclo con estado "Pendiente".' },
            { term: 'Pagado / Pendiente', def: '"Pendiente" significa que registraste el gasto pero no lo has pagado. "Pagado" significa que ya está saldado.' },
            { term: 'Depósito / Retiro', def: 'Transferencias entre tus propios fondos: banco ↔ bolsillo. No son ingresos ni gastos.' },
            { term: 'Cashback', def: 'Un gasto con monto negativo se muestra como "Cashback". Sirve para reembolsos o cashbacks de tarjeta.' },
          ].map(({ term, def }) => (
            <div key={term} className="border-l-4 border-primary-200 pl-4">
              <p className="font-semibold text-gray-800 text-sm">{term}</p>
              <p className="text-sm text-gray-500 mt-0.5">{def}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">El Dashboard explicado</CardTitle>
        <div className="space-y-4">
          {[
            { label: 'Ingresos', color: 'text-accent-500', desc: 'Suma de todos los ingresos del periodo más el efectivo inicial confirmado.' },
            { label: 'Gastos', color: 'text-destructive', desc: 'Suma de todos los gastos (fijos y variables) del periodo.' },
            { label: 'Balance Total', color: 'text-primary', desc: 'Ingresos − Gastos. Si es negativo, gastaste más de lo que entró.' },
            { label: 'Efectivo Restante', color: 'text-accent-500', desc: 'Cuánto efectivo en mano te queda después de gastos en efectivo y depósitos/retiros.' },
            { label: 'Tarjeta/Banco', color: 'text-primary', desc: 'Saldo disponible en tus cuentas/tarjetas después de ingresos no efectivos menos gastos no efectivos.' },
            { label: 'Distribución', color: 'text-gray-700', desc: 'Barras de progreso para Gastos Esenciales y Variables según los porcentajes que definiste.' },
            { label: 'Por Forma de Pago', color: 'text-gray-700', desc: 'Desglose de cuánto gastaste con cada tarjeta o cuenta (solo gastos pendientes).' },
          ].map(({ label, color, desc }) => (
            <div key={label} className="flex gap-3">
              <span className={`font-semibold text-sm w-36 shrink-0 ${color}`}>{label}</span>
              <span className="text-sm text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-2">Preguntas frecuentes</CardTitle>
        {[
          { q: '¿Por qué no puedo borrar "Efectivo"?', a: 'La app necesita "Efectivo" para calcular tu saldo en mano. Si no manejas efectivo, deja el efectivo inicial en 0.' },
          { q: '¿Por qué la app pide confirmar el efectivo?', a: 'Para que el saldo sea exacto desde el primer momento. Si no tienes efectivo, puedes poner 0.' },
          { q: '¿Qué pasa si los porcentajes no suman 100?', a: 'La app no dejará crear el ciclo. Ajusta los valores hasta que sumen exactamente 100%.' },
          { q: '¿Cómo cambio la tasa del dólar?', a: 'Solo los administradores pueden cambiarla en el panel de Admin. La tasa se usa para convertir USD a RD$.' },
          { q: '¿Qué pasa si "Reinicio" un periodo?', a: 'Se borran todos los movimientos y transacciones del periodo y el efectivo se pone a 0. No se puede deshacer.' },
          { q: '¿Dónde veo ciclos anteriores?', a: 'En el Dashboard, usa el selector de mes (flechas ← →) para navegar entre ciclos.' },
        ].map(({ q, a }) => (
          <FaqItem key={q} q={q} a={a} />
        ))}
      </Card>
    </div>
  );
}
