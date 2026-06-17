export default function Ayuda() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Ayuda</h1>
        <p className="text-gray-500">Todo lo que necesitas saber para usar la app desde cero.</p>
      </div>

      {/* Flujo básico */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Flujo básico</h2>
        <ol className="space-y-4">
          {[
            {
              n: '1',
              title: 'Crea tus formas de pago',
              desc: 'Ve a "Formas de Pago" y agrega las tarjetas, cuentas o billeteras que usas. La opción "Efectivo" ya viene creada y no se puede borrar.',
            },
            {
              n: '2',
              title: 'Crea un ciclo de presupuesto',
              desc: 'Ve a "Nuevo Mes" y define las fechas del ciclo, cómo quieres dividirlo (mensual, quincenal o semanal) y qué porcentaje de tus ingresos va a cada categoría.',
            },
            {
              n: '3',
              title: 'Confirma tu efectivo inicial',
              desc: 'Al abrir el Dashboard, la app te pedirá cuánto efectivo tienes en mano al inicio del periodo. Ingresa la cantidad o coloca 0 si no manejas efectivo.',
            },
            {
              n: '4',
              title: 'Registra tus movimientos',
              desc: 'Usa "Agregar Movimiento" para registrar ingresos y gastos. Indica la forma de pago que usaste y si el gasto se repite cada mes.',
            },
            {
              n: '5',
              title: 'Marca los gastos como pagados',
              desc: 'Los gastos tienen una casilla de verificación. Márcalos como pagados cuando hayas efectuado el pago para mantener tu registro al día.',
            },
            {
              n: '6',
              title: 'Registra depósitos y retiros de efectivo',
              desc: 'Si sacas dinero del banco al bolsillo (retiro) o depositas efectivo del bolsillo al banco (depósito), regístralo en la sección "Depósitos y Retiros". Esto mantiene actualizado tu saldo de efectivo.',
            },
            {
              n: '7',
              title: 'Al terminar el mes, crea un nuevo ciclo',
              desc: 'Los gastos que marcaste como "¿Se repite cada mes?" se copiarán automáticamente al nuevo ciclo con estado pendiente.',
            },
          ].map(({ n, title, desc }) => (
            <li key={n} className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {n}
              </span>
              <div>
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Conceptos clave */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Conceptos clave</h2>
        <div className="space-y-5">
          {[
            {
              term: 'Ciclo de presupuesto (Mes)',
              def: 'Es el período de tiempo que quieres controlar, por ejemplo del 1 al 31 de junio. No tiene que ser un mes calendario exacto — tú defines las fechas.',
            },
            {
              term: 'Periodo',
              def: 'Una subdivisión del ciclo. Si elegiste "Mensual", tendrás un solo periodo. Si elegiste "Quincenal", tendrás dos periodos (primera y segunda quincena). Cada periodo tiene su propio efectivo inicial y sus propios movimientos.',
            },
            {
              term: 'Frecuencia del ciclo',
              def: 'Define en cuántas partes se divide el ciclo: Mensual (1), Quincenal (2) o Semanal (4–5). Útil si cobras por quincena o semana y prefieres controlar tu presupuesto en esos intervalos.',
            },
            {
              term: 'Efectivo en mano',
              def: 'El dinero físico que tienes en el bolsillo o en casa. La app lo rastrea por separado del dinero en tarjeta o cuenta bancaria. El saldo de efectivo en mano se calcula así: efectivo inicial − gastos en efectivo ± depósitos y retiros.',
            },
            {
              term: 'Forma de pago',
              def: 'El instrumento que usas para pagar: efectivo, una tarjeta de crédito, una cuenta de banco, PayPal, etc. Solo los gastos pagados con "Efectivo" afectan el saldo de efectivo en mano; los demás afectan el saldo de tarjeta/banco.',
            },
            {
              term: 'Gastos Esenciales (porcentaje del ciclo)',
              def: 'El porcentaje de tus ingresos que destinas a necesidades fijas: alquiler, luz, teléfono, cuotas de préstamos, etc. En el Dashboard se comparan contra los "Gastos Fijos" (gastos que marcaste como recurrentes).',
            },
            {
              term: 'Gastos Variables (porcentaje del ciclo)',
              def: 'El porcentaje de tus ingresos para gastos no esenciales: comer fuera, entretenimiento, ropa, caprichos. En el Dashboard se comparan contra los "Gastos Variables" (gastos que no marcaste como recurrentes).',
            },
            {
              term: '¿Se repite cada mes?',
              def: 'Si marcas esta casilla en un gasto, la app lo copiará automáticamente al mismo periodo del siguiente ciclo, con estado "Pendiente". Úsalo para gastos que pagas todos los meses: arriendo, Netflix, seguro, etc.',
            },
            {
              term: 'Pagado / Pendiente',
              def: '"Pendiente" significa que registraste el gasto pero todavía no lo has pagado. "Pagado" significa que ya está saldado. Usa esto para saber qué facturas te quedan por pagar.',
            },
            {
              term: 'Depósito / Retiro de efectivo',
              def: 'Un depósito es cuando sacas dinero del banco y lo pones en tu bolsillo (efectivo ↑, banco ↓). Un retiro es lo contrario: llevas efectivo al banco (efectivo ↓, banco ↑). No son ingresos ni gastos, solo transferencias entre tus propios fondos.',
            },
            {
              term: 'Cashback',
              def: 'Si registras un gasto con monto negativo, la app lo muestra como "Cashback" con signo positivo y en verde. Sirve para registrar reembolsos, descuentos o cashbacks de tarjeta.',
            },
          ].map(({ term, def }) => (
            <div key={term} className="border-l-4 border-blue-200 pl-4">
              <p className="font-semibold text-gray-800">{term}</p>
              <p className="text-sm text-gray-500 mt-0.5">{def}</p>
            </div>
          ))}
        </div>
      </section>

      {/* El Dashboard explicado */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">El Dashboard explicado</h2>
        <div className="space-y-4">
          {[
            {
              label: 'Ingresos',
              color: 'text-green-600',
              desc: 'Suma de todos los ingresos del periodo más el efectivo inicial confirmado.',
            },
            {
              label: 'Gastos',
              color: 'text-red-600',
              desc: 'Suma de todos los gastos (fijos y variables) del periodo.',
            },
            {
              label: 'Balance Total',
              color: 'text-blue-600',
              desc: 'Ingresos − Gastos. Si es negativo, gastaste más de lo que entró.',
            },
            {
              label: 'Efectivo Restante',
              color: 'text-green-600',
              desc: 'Cuánto efectivo en mano te queda. Empieza con tu efectivo inicial y se reduce con cada gasto pagado en efectivo. Los depósitos/retiros también lo ajustan.',
            },
            {
              label: 'Tarjeta/Banco Restante',
              color: 'text-blue-600',
              desc: 'El saldo disponible en tus cuentas/tarjetas después de tus ingresos no efectivos menos los gastos no efectivos.',
            },
            {
              label: 'Distribución del Presupuesto',
              color: 'text-gray-700',
              desc: 'Muestra las barras de progreso para Gastos Esenciales y Gastos Variables según los porcentajes que definiste al crear el ciclo.',
            },
            {
              label: 'Gastos por Forma de Pago',
              color: 'text-gray-700',
              desc: 'Desglose de cuánto gastaste con cada tarjeta o cuenta. Solo incluye gastos pendientes (no pagados aún).',
            },
          ].map(({ label, color, desc }) => (
            <div key={label} className="flex gap-3">
              <span className={`font-semibold text-sm w-40 shrink-0 ${color}`}>{label}</span>
              <span className="text-sm text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Preguntas frecuentes</h2>
        <div className="space-y-5">
          {[
            {
              q: '¿Por qué no puedo borrar la forma de pago "Efectivo"?',
              a: 'La app necesita "Efectivo" para calcular tu saldo en mano. Si no manejas efectivo, simplemente ignórala o deja el efectivo inicial en 0 al inicio de cada periodo.',
            },
            {
              q: '¿Por qué la app me pide confirmar el efectivo antes de registrar movimientos?',
              a: 'Para que el saldo de efectivo sea exacto desde el primer momento. Si no tienes efectivo en mano al iniciar el periodo, puedes poner 0 u omitir el paso.',
            },
            {
              q: '¿Qué pasa si los porcentajes de mi presupuesto no suman 100?',
              a: 'La app no dejará crear el ciclo. Ajusta los valores hasta que sumen exactamente 100%.',
            },
            {
              q: '¿Cómo cambio la tasa del dólar?',
              a: 'Solo los administradores pueden cambiar la tasa en el panel de Admin. La tasa se usa para convertir montos en USD a RD$ en todos los cálculos.',
            },
            {
              q: '¿Qué pasa si "Reinicio" un periodo?',
              a: 'Se borran todos los movimientos y transacciones del periodo y el efectivo inicial se pone a 0. Esta acción no se puede deshacer.',
            },
            {
              q: '¿Dónde veo todos mis ciclos anteriores?',
              a: 'En el Dashboard, usa el selector de mes (las flechas ← →) para navegar entre ciclos anteriores.',
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="font-semibold text-gray-800 text-sm">{q}</p>
              <p className="text-sm text-gray-500 mt-1">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
