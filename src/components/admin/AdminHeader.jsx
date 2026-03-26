import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LogOut, User, FlaskConical } from 'lucide-react'

export default function AdminHeader() {
  const { user, isDemo, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  return (
    <>
      {isDemo && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 flex items-center justify-center gap-2 py-2 px-4">
          <FlaskConical className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-400 text-xs font-bold tracking-wide">
            MODO DEMO — Los datos mostrados son de prueba y no se guardan en ninguna base de datos
          </span>
        </div>
      )}
      <header className="h-16 bg-gym-dark border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-semibold text-sm">Panel de Administración</h1>
          {isDemo && (
            <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-500/30">
              DEMO
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gym-gray">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gym-gray hover:text-gym-red transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>
    </>
  )
}
