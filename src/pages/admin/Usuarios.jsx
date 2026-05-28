import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { logAction } from '../../utils/auditLog'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ROLES = ['admin', 'entrenador', 'recepcionista']

const ROLE_COLORS = {
  admin: 'bg-gym-red/10 text-gym-red',
  entrenador: 'bg-blue-500/10 text-blue-400',
  recepcionista: 'bg-green-500/10 text-green-400',
}

export default function Usuarios() {
  const { profile } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProfiles() }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) toast.error('Error al cargar usuarios')
    else setProfiles(data || [])
    setLoading(false)
  }

  const changeRole = async (targetProfile, newRole) => {
    if (targetProfile.id === profile.id) {
      toast.error('No podés cambiar tu propio rol')
      return
    }
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetProfile.id)
    if (error) { toast.error('Error al actualizar rol'); return }
    await logAction({
      profileId: profile.id,
      accion: 'cambió_rol',
      entidadTipo: 'usuario',
      entidadId: targetProfile.id,
      detalles: { de: targetProfile.role, a: newRole, usuario: targetProfile.nombre },
    })
    toast.success(`Rol de ${targetProfile.nombre} actualizado a ${newRole}`)
    fetchProfiles()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">Usuarios</h2>
        <p className="text-gym-gray text-xs sm:text-sm mt-1">{profiles.length} usuarios del sistema</p>
      </div>

      <div className="bg-gym-dark border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gym-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Usuario</th>
                    <th className="text-left px-6 py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Rol</th>
                    <th className="text-left px-6 py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Desde</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gym-red/20 flex items-center justify-center text-gym-red font-bold text-sm flex-shrink-0">
                            {p.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">{p.nombre}</div>
                            {p.id === profile.id && (
                              <div className="text-gym-gray text-xs">vos</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gym-gray text-sm">{p.email || '—'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={p.role}
                          disabled={p.id === profile.id}
                          onChange={(e) => changeRole(p, e.target.value)}
                          className="bg-gym-black border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gym-red disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gym-gray text-xs">
                        {format(new Date(p.created_at), 'dd MMM yy', { locale: es })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden space-y-2 p-3">
              {profiles.map((p) => (
                <div key={p.id} className="bg-gym-black border border-white/5 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gym-red/20 flex items-center justify-center text-gym-red font-bold text-sm flex-shrink-0">
                        {p.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{p.nombre}</div>
                        <div className="text-gym-gray text-xs">{p.email || '—'}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${ROLE_COLORS[p.role]}`}>
                      {p.role}
                    </span>
                  </div>
                  {p.id !== profile.id && (
                    <select
                      value={p.role}
                      onChange={(e) => changeRole(p, e.target.value)}
                      className="w-full bg-gym-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gym-red"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
