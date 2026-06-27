import { useState } from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Ciclos de Presupuesto Flexibles',
    description: 'Define tu ciclo mensual, quincenal o semanal. Tu decides como dividir tu tiempo y tus ingresos.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Doble Moneda (RD$ y USD)',
    description: 'Registra gastos en pesos dominicanos o dolares. La app convierte automaticamente al tipo de cambio actual.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Multiples Formas de Pago',
    description: 'Efectivo, tarjetas, cuentas bancarias, billeteras digitales. Controla cuanto gastas con cada metodo.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: 'Gastos Fijos Automaticos',
    description: 'Marca tus gastos recurrentes y se copian automaticamente al siguiente ciclo. Nunca olvides una factura.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Control de Efectivo',
    description: 'Registra depositos y retiros para saber exactamente cuanto efectivo tienes en mano en todo momento.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Dashboard Intuitivo',
    description: 'Visualiza ingresos, gastos, balance y distribucion de presupuesto en un solo vistazo.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const steps = [
  { title: 'Crea tu cuenta', description: 'Registrate gratis en segundos. No necesitas tarjeta de credito.' },
  { title: 'Configura tus formas de pago', description: 'Agrega las tarjetas y cuentas que usas para pagar.' },
  { title: 'Crea tu primer ciclo', description: 'Define las fechas, frecuencia y como quieres distribuir tus ingresos.' },
  { title: 'Registra y controla', description: 'Agrega tus ingresos y gastos. La app te muestra cuanto te queda en tiempo real.' },
];

const mockStats = [
  { label: 'Ingresos', value: 'RD$ 45,000.00', color: 'text-green-600' },
  { label: 'Gastos', value: 'RD$ 28,500.00', color: 'text-red-600' },
  { label: 'Balance', value: 'RD$ 16,500.00', color: 'text-blue-600' },
  { label: 'Efectivo', value: 'RD$ 5,200.00', color: 'text-green-600' },
  { label: 'Tarjeta/Banco', value: 'RD$ 11,300.00', color: 'text-blue-600' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">PresupuestoApp</Link>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition text-sm font-medium">
                Iniciar Sesion
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium">
                Crear Cuenta
              </Link>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-800">
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition text-sm font-medium">
                Iniciar Sesion
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium">
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Toma el control de tus finanzas personales
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-4 max-w-xl mx-auto lg:mx-0">
              Organiza tus ingresos, controla tus gastos y ahorra mas cada mes. Maneja pesos dominicanos y dolares en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
              <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition text-lg font-medium text-center">
                Comenzar Gratis
              </Link>
              <button
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition text-lg text-center"
              >
                Ver como funciona
              </button>
            </div>
          </div>

          {/* Decorative mini dashboard */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg">
            <div className="bg-white rounded-xl shadow-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 text-xs text-gray-400">Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-gray-500">Ingresos</p>
                  <p className="text-sm font-bold text-green-600">RD$ 45,000</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-xs text-gray-500">Gastos</p>
                  <p className="text-sm font-bold text-red-600">RD$ 28,500</p>
                </div>
                <div className="col-span-2 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-gray-500">Balance Disponible</p>
                  <p className="text-lg font-bold text-blue-600">RD$ 16,500.00</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Gastos Esenciales</span>
                  <span className="text-gray-700 font-medium">50%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Gastos Variables</span>
                  <span className="text-gray-700 font-medium">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Ahorros</span>
                  <span className="text-gray-700 font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Todo lo que necesitas para manejar tu dinero</h2>
          <p className="text-gray-600 mt-3 text-center max-w-2xl mx-auto">
            Herramientas simples y efectivas para organizar tu presupuesto personal.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-lg shadow p-6 border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Empieza en minutos</h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && <div className="w-0.5 bg-blue-200 flex-1 mt-2"></div>}
                </div>
                <div className="pb-8">
                  <h3 className="font-semibold text-gray-800 text-lg">{step.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Tu dinero, organizado y claro</h2>
          <p className="text-gray-600 mt-3 text-center max-w-2xl mx-auto">
            Un dashboard que te muestra exactamente donde esta tu dinero.
          </p>
          <div className="mt-12 bg-gray-100 rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-200">
            <div className="bg-white rounded-t-lg h-10 flex items-center px-4 border-b border-gray-200 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-2 text-xs text-gray-400 font-medium">PresupuestoApp — Dashboard</span>
            </div>
            <div className="bg-white rounded-b-lg p-4 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {mockStats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className={`text-sm sm:text-base font-bold ${stat.color} mt-1`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Gastos Esenciales (50%)</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-gray-600">Alquiler</span><span className="text-red-500">-RD$ 12,000</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-600">Internet</span><span className="text-red-500">-RD$ 1,800</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-600">Electricidad</span><span className="text-red-500">-RD$ 2,500</span></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Gastos Variables (30%)</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-gray-600">Restaurante</span><span className="text-red-500">-RD$ 3,200</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-600">Entretenimiento</span><span className="text-red-500">-RD$ 2,000</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-600">Compras</span><span className="text-red-500">-RD$ 4,500</span></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Ahorros (20%)</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-gray-600">Fondo emergencia</span><span className="text-green-500">RD$ 5,000</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-600">Meta viaje</span><span className="text-green-500">RD$ 2,500</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Listo para organizar tu dinero?</h2>
          <p className="text-blue-100 mt-4 text-lg">
            Unete gratis y empieza a tomar mejores decisiones financieras hoy.
          </p>
          <Link to="/register" className="mt-8 inline-block bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-blue-50 transition text-lg font-medium">
            Crear Mi Cuenta
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-bold">PresupuestoApp</span>
          <span className="text-gray-400 text-sm">&copy; 2026 PresupuestoApp. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
