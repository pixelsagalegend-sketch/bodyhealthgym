const testimonios = [
  {
    name: 'Carlos M.',
    role: 'Miembro desde 2023',
    text: 'En 6 meses logré resultados que no creía posibles. Los entrenadores son increíbles y el ambiente te motiva.',
    rating: 5,
  },
  {
    name: 'María G.',
    role: 'Miembro desde 2022',
    text: 'El mejor gimnasio de la ciudad. Las clases de zumba son espectaculares y el precio es muy accesible.',
    rating: 5,
  },
  {
    name: 'Roberto L.',
    role: 'Miembro desde 2024',
    text: 'Vine un día de prueba y ya llevo 8 meses. La calidad del equipo y la atención son excelentes.',
    rating: 5,
  },
]

export default function Testimonios() {
  return (
    <section id="testimonios" className="py-24 px-4 bg-gym-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gym-red text-sm font-bold tracking-widest uppercase">Lo dicen nuestros miembros</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">
            TESTIMONIOS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonios.map((t) => (
            <div key={t.name} className="bg-gym-dark border border-white/5 rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-gym-red text-lg">★</span>
                ))}
              </div>
              <p className="text-gym-gray text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div>
                <div className="text-white font-bold text-sm">{t.name}</div>
                <div className="text-gym-gray text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
