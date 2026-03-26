import { MapPin, Phone, Clock, Mail } from 'lucide-react'

const info = [
  { icon: MapPin, label: 'Dirección', value: 'Av. Principal #123, Ciudad' },
  { icon: Phone, label: 'Teléfono', value: '+1 (555) 123-4567' },
  { icon: Mail, label: 'Email', value: 'info@bodyhealthgym.com' },
  { icon: Clock, label: 'Horario', value: 'Lun–Sáb: 5am–10pm | Dom: 7am–3pm' },
]

export default function Contacto() {
  return (
    <section id="contacto" className="py-24 px-4 bg-gym-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gym-red text-sm font-bold tracking-widest uppercase">Estamos aquí</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">
            CONT<span className="text-gym-red">ACTO</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {info.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gym-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-gym-red" />
                </div>
                <div>
                  <div className="text-gym-gray text-xs font-semibold uppercase tracking-wider">{item.label}</div>
                  <div className="text-white font-medium mt-1">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gym-black border border-white/5 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-6">Envíanos un mensaje</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full bg-gym-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gym-gray focus:outline-none focus:border-gym-red transition-colors"
              />
              <input
                type="email"
                placeholder="Tu correo"
                className="w-full bg-gym-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gym-gray focus:outline-none focus:border-gym-red transition-colors"
              />
              <textarea
                rows={4}
                placeholder="Tu mensaje..."
                className="w-full bg-gym-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gym-gray focus:outline-none focus:border-gym-red transition-colors resize-none"
              />
              <button
                type="submit"
                className="w-full bg-gym-red hover:bg-gym-red-hover text-white font-bold py-3 rounded-lg transition-colors"
              >
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
