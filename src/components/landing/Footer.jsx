import { Link } from 'react-router-dom'
import { Dumbbell, Camera, Tv, Play } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gym-black border-t border-white/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gym-red rounded-full flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg text-white">
              BODY HEALTH <span className="text-gym-red">GYM</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {[Camera, Tv, Play].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 bg-gym-dark border border-white/10 rounded-lg flex items-center justify-center text-gym-gray hover:text-white hover:border-gym-red transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-gym-gray text-sm">
          © {new Date().getFullYear()} Body Health Gym. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
