import { Dumbbell, Heart, Users, Apple, Timer, Trophy } from 'lucide-react'

const servicios = [
  { icon: Dumbbell, title: 'Musculación', desc: 'Equipos de pesas de última generación para sculpting y fuerza.' },
  { icon: Heart, title: 'Cardio', desc: 'Treadmills, bicicletas y elípticas con pantallas integradas.' },
  { icon: Users, title: 'Clases Grupales', desc: 'Zumba, spinning, yoga y más con instructores certificados.' },
  { icon: Apple, title: 'Nutrición', desc: 'Planes nutricionales personalizados para alcanzar tus metas.' },
  { icon: Timer, title: 'Entrenamiento HIIT', desc: 'Quema grasa y gana resistencia con rutinas de alta intensidad.' },
  { icon: Trophy, title: 'Entrenamiento Personal', desc: 'Sesiones 1 a 1 diseñadas exclusivamente para ti.' },
]

export default function Servicios() {
  return (
    <section id="servicios" className="py-24 px-4 bg-gym-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gym-red text-sm font-bold tracking-widest uppercase">Lo que ofrecemos</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">
            NUESTROS <span className="text-gym-red">SERVICIOS</span>
          </h2>
          <p className="text-gym-gray mt-4 max-w-xl mx-auto">
            Todo lo que necesitas para alcanzar tu mejor versión, en un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((s) => (
            <div
              key={s.title}
              className="bg-gym-black border border-white/5 rounded-2xl p-6 hover:border-gym-red/30 hover:bg-gym-black/80 transition-all group"
            >
              <div className="w-12 h-12 bg-gym-red/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gym-red/20 transition-colors">
                <s.icon className="w-6 h-6 text-gym-red" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-gym-gray text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
