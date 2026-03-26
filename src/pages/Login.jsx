import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Dumbbell, Eye, EyeOff, FlaskConical } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error('Credenciales incorrectas')
    } else {
      toast.success('¡Bienvenido!')
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gym-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gym-red rounded-full flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              BODY HEALTH <span className="text-gym-red">GYM</span>
            </span>
          </Link>
          <p className="text-gym-gray mt-2 text-sm">Panel de Administración</p>
        </div>

        {/* Card */}
        <div className="bg-gym-dark border border-white/5 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gym-gray mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                {...register('email', { required: 'El correo es requerido' })}
                className="w-full bg-gym-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gym-gray focus:outline-none focus:border-gym-red transition-colors"
                placeholder="admin@bodyhealthgym.com"
              />
              {errors.email && <p className="text-gym-red text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gym-gray mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'La contraseña es requerida' })}
                  className="w-full bg-gym-black border border-white/10 rounded-lg px-4 py-3 pr-12 text-white placeholder-gym-gray focus:outline-none focus:border-gym-red transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gym-gray hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-gym-red text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gym-red hover:bg-gym-red-hover disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Entrar al panel'}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold">Modo Demo disponible</span>
          </div>
          <p className="text-yellow-400/70 text-xs mb-2">Prueba el panel sin configurar Supabase:</p>
          <div className="space-y-1">
            <p className="text-xs text-gym-gray font-mono">Email: <span className="text-white">admin@demo.com</span></p>
            <p className="text-xs text-gym-gray font-mono">Contraseña: <span className="text-white">demo1234</span></p>
          </div>
        </div>

        <p className="text-center text-gym-gray text-sm mt-4">
          <Link to="/" className="text-gym-red hover:text-white transition-colors">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  )
}
