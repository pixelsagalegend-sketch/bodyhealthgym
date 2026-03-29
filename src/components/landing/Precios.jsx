import { Check } from 'lucide-react'

const planes = [
  {
    name: 'Inscripción',
    price: '$5',
    period: 'pago único',
    desc: 'Acceso y registro inicial al gimnasio.',
    features: ['Registro en sistema', 'Evaluación inicial', 'Acceso al área de clientes'],
    highlight: false,
    cta: 'Registrarme',
  },
  {
    name: 'Membresía Mensual',
    price: '$25',
    period: '/ mes',
    desc: 'Acceso ilimitado durante 30 días.',
    features: ['Acceso ilimitado', 'Todas las áreas', 'Clases grupales incluidas', 'Vestuarios y casilleros'],
    highlight: true,
    cta: '¡El más popular!',
    badge: 'POPULAR',
  },
  {
    name: 'Pack Nuevo Cliente',
    price: '$30',
    period: 'inscripción + 1 mes',
    desc: 'Todo incluido para empezar hoy mismo.',
    features: ['Inscripción incluida', 'Primer mes completo', 'Asesoría de bienvenida', 'Evaluación física'],
    highlight: false,
    cta: '¡Empieza hoy!',
  },
]

export default function Precios() {
  return (
    <section id="precios" className="py-24 px-4 bg-gym-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gym-red text-sm font-bold tracking-widest uppercase">Sin letra pequeña</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">
            PLANES Y <span className="text-gym-red">PRECIOS</span>
          </h2>
          <p className="text-gym-gray mt-4 max-w-xl mx-auto">
            Precios transparentes para que te enfoques en lo que importa: entrenar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planes.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-transform duration-200 hover:-translate-y-1 ${
                plan.highlight
                  ? 'bg-gym-red border-gym-red shadow-2xl shadow-gym-red/20'
                  : 'bg-gym-dark border-white/10 hover:border-gym-red/30'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-gym-red text-xs font-black px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.highlight ? 'text-white/70' : 'text-gym-gray'}`}>{plan.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className={`text-sm mb-1 ${plan.highlight ? 'text-white/70' : 'text-gym-gray'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-white' : 'text-gym-red'}`} />
                    <span className={`text-sm ${plan.highlight ? 'text-white/90' : 'text-gym-gray'}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className={`block text-center font-bold py-3 rounded-xl btn-interactive ${
                  plan.highlight
                    ? 'bg-white text-gym-red hover:bg-white/90'
                    : 'bg-gym-red hover:bg-gym-red-hover text-white'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Pago diario */}
        <div className="mt-8 bg-gym-dark border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-white font-bold text-lg">Pago Diario</h4>
            <p className="text-gym-gray text-sm mt-1">¿Solo vienes un día? Sin problema. Paga únicamente lo que usas.</p>
          </div>
          <a
            href="#contacto"
            className="flex-shrink-0 border border-gym-red text-gym-red hover:bg-gym-red hover:text-white font-bold px-6 py-3 rounded-xl btn-interactive"
          >
            Consultar precio →
          </a>
        </div>
      </div>
    </section>
  )
}
