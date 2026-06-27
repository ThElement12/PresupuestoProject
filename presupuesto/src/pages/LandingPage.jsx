import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDots, CurrencyDollar, CreditCard, ArrowsClockwise, Wallet, ChartBar, List, X } from '@phosphor-icons/react';
import { Button } from '../components/ui';

const features = [
  { title: 'Ciclos de Presupuesto Flexibles', description: 'Define tu ciclo mensual, quincenal o semanal. Tu decides como dividir tu tiempo y tus ingresos.', icon: CalendarDots },
  { title: 'Doble Moneda (RD$ y USD)', description: 'Registra gastos en pesos dominicanos o dolares. La app convierte automaticamente al tipo de cambio actual.', icon: CurrencyDollar },
  { title: 'Multiples Formas de Pago', description: 'Efectivo, tarjetas, cuentas bancarias, billeteras digitales. Controla cuanto gastas con cada metodo.', icon: CreditCard },
  { title: 'Gastos Fijos Automaticos', description: 'Marca tus gastos recurrentes y se copian automaticamente al siguiente ciclo. Nunca olvides una factura.', icon: ArrowsClockwise },
  { title: 'Control de Efectivo', description: 'Registra depositos y retiros para saber exactamente cuanto efectivo tienes en mano en todo momento.', icon: Wallet },
  { title: 'Dashboard Intuitivo', description: 'Visualiza ingresos, gastos, balance y distribucion de presupuesto en un solo vistazo.', icon: ChartBar },
];

const steps = [
  { title: 'Crea tu cuenta', description: 'Registrate gratis en segundos. No necesitas tarjeta de credito.' },
  { title: 'Configura tus formas de pago', description: 'Agrega las tarjetas y cuentas que usas para pagar.' },
  { title: 'Crea tu primer ciclo', description: 'Define las fechas, frecuencia y como quieres distribuir tus ingresos.' },
  { title: 'Registra y controla', description: 'Agrega tus ingresos y gastos. La app te muestra cuanto te queda en tiempo real.' },
];

const mockStats = [
  { label: 'Ingresos', value: 'RD$ 45,000.00', color: 'text-accent-500' },
  { label: 'Gastos', value: 'RD$ 28,500.00', color: 'text-destructive' },
  { label: 'Balance', value: 'RD$ 16,500.00', color: 'text-primary' },
  { label: 'Efectivo', value: 'RD$ 5,200.00', color: 'text-accent-500' },
  { label: 'Tarjeta/Banco', value: 'RD$ 11,300.00', color: 'text-primary' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-card">
      <nav className="sticky top-0 z-50 bg-surface-card/95 backdrop-blur-sm shadow-card border-b border-[#DBEAFE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-primary tracking-tight">PresupuestoApp</Link>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Crear Cuenta</Button>
              </Link>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Menú"
            >
              {menuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-slide-up">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block">
                <Button variant="outline" className="w-full">Iniciar Sesión</Button>
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block">
                <Button className="w-full">Crear Cuenta</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section className="bg-gradient-to-br from-primary-50 via-surface-card to-primary-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Toma el control de tus finanzas personales
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 mt-4 max-w-xl mx-auto lg:mx-0">
              Organiza tus ingresos, controla tus gastos y ahorra mas cada mes. Maneja pesos dominicanos y dolares en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">Comenzar Gratis</Button>
              </Link>
              <button
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-muted text-gray-600 px-8 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-base cursor-pointer"
              >
                Ver como funciona
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-lg">
            <div className="bg-surface-card rounded-2xl shadow-modal p-5 border border-[#DBEAFE]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
                <div className="w-3 h-3 rounded-full bg-warning/60"></div>
                <div className="w-3 h-3 rounded-full bg-accent/60"></div>
                <span className="ml-2 text-xs text-gray-400">Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-accent-50 rounded-xl p-3 border border-accent-100">
                  <p className="text-xs text-gray-500">Ingresos</p>
                  <p className="text-sm font-bold text-accent-500">RD$ 45,000</p>
                </div>
                <div className="bg-destructive-50 rounded-xl p-3 border border-destructive-100">
                  <p className="text-xs text-gray-500">Gastos</p>
                  <p className="text-sm font-bold text-destructive">RD$ 28,500</p>
                </div>
                <div className="col-span-2 bg-primary-50 rounded-xl p-3 border border-primary-100">
                  <p className="text-xs text-gray-500">Balance Disponible</p>
                  <p className="text-lg font-bold text-primary">RD$ 16,500.00</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { label: 'Gastos Esenciales', pct: '50%', width: '65%', color: 'bg-primary-500' },
                  { label: 'Gastos Variables', pct: '30%', width: '45%', color: 'bg-warning' },
                  { label: 'Ahorros', pct: '20%', width: '30%', color: 'bg-accent' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{bar.label}</span>
                      <span className="text-gray-700 font-medium">{bar.pct}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div className={`${bar.color} h-2 rounded-full`} style={{ width: bar.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-surface-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Todo lo que necesitas para manejar tu dinero</h2>
          <p className="text-gray-500 mt-3 text-center max-w-2xl mx-auto">
            Herramientas simples y efectivas para organizar tu presupuesto personal.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {features.map(({ title, description, icon: Icon }) => (
              <div key={title} className="bg-surface-card rounded-xl shadow-card p-6 border border-[#DBEAFE] hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-16 sm:py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Empieza en minutos</h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && <div className="w-0.5 bg-primary-200 flex-1 mt-2"></div>}
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

      <section className="py-16 sm:py-20 bg-surface-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Tu dinero, organizado y claro</h2>
          <p className="text-gray-500 mt-3 text-center max-w-2xl mx-auto">
            Un dashboard que te muestra exactamente donde esta tu dinero.
          </p>
          <div className="mt-12 bg-surface rounded-2xl p-4 sm:p-6 shadow-modal border border-[#DBEAFE]">
            <div className="bg-surface-card rounded-t-lg h-10 flex items-center px-4 border-b border-[#DBEAFE] gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
              <div className="w-3 h-3 rounded-full bg-warning/60"></div>
              <div className="w-3 h-3 rounded-full bg-accent/60"></div>
              <span className="ml-2 text-xs text-gray-400 font-medium">PresupuestoApp — Dashboard</span>
            </div>
            <div className="bg-surface-card rounded-b-lg p-4 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {mockStats.map((stat) => (
                  <div key={stat.label} className="bg-surface-card rounded-xl shadow-card p-4 border border-[#DBEAFE]">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className={`text-sm sm:text-base font-bold ${stat.color} mt-1 tabular-nums`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: 'Gastos Esenciales (50%)', items: [['Alquiler', '-RD$ 12,000'], ['Internet', '-RD$ 1,800'], ['Electricidad', '-RD$ 2,500']], itemColor: 'text-destructive' },
                  { title: 'Gastos Variables (30%)', items: [['Restaurante', '-RD$ 3,200'], ['Entretenimiento', '-RD$ 2,000'], ['Compras', '-RD$ 4,500']], itemColor: 'text-destructive' },
                  { title: 'Ahorros (20%)', items: [['Fondo emergencia', 'RD$ 5,000'], ['Meta viaje', 'RD$ 2,500']], itemColor: 'text-accent-500' },
                ].map((col) => (
                  <div key={col.title} className="bg-surface rounded-xl p-3 border border-[#DBEAFE]">
                    <p className="text-xs text-gray-400 mb-2">{col.title}</p>
                    <div className="space-y-1">
                      {col.items.map(([name, amount]) => (
                        <div key={name} className="flex justify-between text-xs">
                          <span className="text-gray-600">{name}</span>
                          <span className={col.itemColor}>{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Listo para organizar tu dinero?</h2>
          <p className="text-primary-200 mt-4 text-lg">
            Unete gratis y empieza a tomar mejores decisiones financieras hoy.
          </p>
          <Link to="/register" className="mt-8 inline-block">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-primary-50 text-base px-8">
              Crear Mi Cuenta
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-bold tracking-tight">PresupuestoApp</span>
          <span className="text-gray-500 text-sm">&copy; 2026 PresupuestoApp. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
