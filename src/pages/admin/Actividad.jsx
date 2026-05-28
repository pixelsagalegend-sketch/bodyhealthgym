import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ACTION_LABELS = {
  creó_cliente: 'Registró cliente',
  activó_cliente: 'Activó cliente',
  desactivó_cliente: 'Desactivó cliente',
  eliminó_cliente: 'Eliminó cliente',
  registró_pago: 'Registró pago',
  registró_pago_parcial: 'Pago parcial',
  cambió_rol: 'Cambió rol',
}

const ACTION_COLORS = {
  creó_cliente: 'text-green-400',
  activó_cliente: 'text-blue-400',
  desactivó_cliente: 'text-yellow-400',
  eliminó_cliente: 'text-red-400',
  registró_pago: 'text-green-400',
  registró_pago_parcial: 'text-blue-400',
  cambió_rol: 'text-gym-red',
}

export default function Actividad() {
  const [logs, setLogs] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')

  useEffect(() => {
    Promise.all([fetchLogs(), fetchProfiles()])
  }, [])

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('id, nombre')
    setProfiles(data || [])
  }

  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('audit_log')
      .select('*, profiles(nombre, email, role)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (!error) setLogs(data || [])
    setLoading(false)
  }

  const filtered = logs.filter((l) => {
    if (filtroUsuario && l.user_id !== filtroUsuario) return false
    if (filtroAccion && l.accion !== filtroAccion) return false
    return true
  })

  const formatDetalles = (log) => {
    const d = log.detalles
    if (!d) return null
    if (d.nombre) return d.nombre
    if (d.de) return `de "${d.de}" → "${d.a}" (${d.usuario})`
    if (d.monto) return `$${Number(d.monto).toFixed(2)} — ${d.tipo ?? ''}`
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">Actividad</h2>
        <p className="text-gym-gray text-xs sm:text-sm mt-1">Registro de acciones del sistema</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filtroUsuario}
          onChange={(e) => setFiltroUsuario(e.target.value)}
          className="bg-gym-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gym-red"
        >
          <option value="">Todos los usuarios</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <select
          value={filtroAccion}
          onChange={(e) => setFiltroAccion(e.target.value)}
          className="bg-gym-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gym-red"
        >
          <option value="">Todas las acciones</option>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gym-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gym-gray text-sm">Sin actividad registrada</div>
        ) : (
          filtered.map((log) => (
            <div key={log.id} className="bg-gym-dark border border-white/5 rounded-xl p-3 sm:p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gym-red/20 flex items-center justify-center text-gym-red font-bold text-sm flex-shrink-0">
                {log.profiles?.nombre?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">
                    {log.profiles?.nombre ?? 'Usuario eliminado'}
                  </span>
                  <span className="text-gym-gray text-xs">·</span>
                  <span className={`text-xs font-semibold ${ACTION_COLORS[log.accion] ?? 'text-gym-gray'}`}>
                    {ACTION_LABELS[log.accion] ?? log.accion}
                  </span>
                </div>
                {formatDetalles(log) && (
                  <div className="text-gym-gray text-xs mt-0.5 truncate">{formatDetalles(log)}</div>
                )}
              </div>
              <div className="text-gym-gray text-xs flex-shrink-0 text-right">
                {format(new Date(log.created_at), 'dd MMM · HH:mm', { locale: es })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
