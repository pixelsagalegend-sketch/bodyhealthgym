import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Search, UserCheck, UserX, X, CreditCard, ClipboardList, MessageCircle, ChevronDown, Calendar } from 'lucide-react'
import { sendWhatsApp } from '../../utils/whatsapp'
import { PRECIOS_BASE } from '../../constants/prices'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Country codes for phone input
const COUNTRY_CODES = [
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
]

// Phone Input Component with Country Code Selector
function PhoneInputWithCode({ field }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0])
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const phoneNumber = field.value ? field.value.replace(/\D/g, '').replace(selectedCode.code.replace('+', ''), '') : ''

  const handleCodeChange = (newCode) => {
    setSelectedCode(newCode)
    const numberOnly = field.value ? field.value.replace(/\D/g, '').replace(selectedCode.code.replace('+', ''), '') : ''
    field.onChange(`${newCode.code}${numberOnly}`)
    setIsOpen(false)
  }

  const handlePhoneChange = (e) => {
    const numberOnly = e.target.value.replace(/\D/g, '')
    field.onChange(`${selectedCode.code}${numberOnly}`)
  }

  return (
    <div ref={containerRef} className="relative flex">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gym-black border border-white/10 rounded-lg rounded-r-none px-3 py-2.5 text-white text-sm hover:border-gym-red/50 transition-colors flex-shrink-0"
      >
        <span className="text-base">{selectedCode.flag}</span>
        <span className="font-semibold">{selectedCode.code}</span>
        <ChevronDown className="w-3 h-3 text-gym-gray" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-gym-dark border border-white/10 rounded-lg shadow-lg z-10 w-48 max-h-64 overflow-y-auto">
          {COUNTRY_CODES.map((cc) => (
            <button
              key={cc.code}
              type="button"
              onClick={() => handleCodeChange(cc)}
              className="w-full text-left px-4 py-2.5 hover:bg-gym-red/20 text-white text-sm flex items-center gap-2 border-b border-white/5 last:border-b-0 transition-colors"
            >
              <span className="text-base">{cc.flag}</span>
              <span className="font-semibold">{cc.code}</span>
              <span className="text-gym-gray text-xs ml-auto">{cc.country}</span>
            </button>
          ))}
        </div>
      )}

      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        className="flex-1 bg-gym-black border border-white/10 rounded-lg rounded-l-none px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-red"
        placeholder="987654321"
      />
    </div>
  )
}


// Traduce errores técnicos de la BD a mensajes legibles en español
function getFriendlyError(err) {
  const msg = err?.message || ''
  if (msg.includes('clients_email_key') || (msg.includes('unique') && msg.includes('email')))
    return 'Ya existe un cliente registrado con ese correo electrónico'
  if (msg.includes('clients_telefono') || (msg.includes('unique') && msg.includes('telefono')))
    return 'Ya existe un cliente registrado con ese número de teléfono'
  if (msg.includes('not-null') || msg.includes('null value'))
    return 'Completa todos los campos obligatorios'
  if (msg.includes('violates check constraint'))
    return 'Uno o más datos ingresados no son válidos'
  if (msg.includes('foreign key'))
    return 'Error de referencia en los datos. Intenta nuevamente'
  return 'Ocurrió un error al registrar el cliente. Intenta nuevamente'
}

export default function Clientes() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPagos, setShowPagos] = useState(null)
  const [pagos, setPagos] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('pagos')
  const [highlightId, setHighlightId] = useState(null)
  const [partialPaymentAmount, setPartialPaymentAmount] = useState('')
  const [loadingPartialPayment, setLoadingPartialPayment] = useState(false)

  const { register, handleSubmit, reset, control, setError, formState: { errors } } = useForm({
    defaultValues: {
      fechaInscripcion: format(new Date(), 'yyyy-MM-dd')
    }
  })

  useEffect(() => { fetchClients() }, [user])

  useEffect(() => {
    const hid = searchParams.get('highlight')
    if (!hid) return
    setHighlightId(hid)
    const timer = setTimeout(() => {
      setHighlightId(null)
      searchParams.delete('highlight')
      setSearchParams(searchParams)
    }, 3000)
    return () => clearTimeout(timer)
  }, [searchParams, setSearchParams])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clients.filter((c) =>
      `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(q)
    )
  }, [search, clients])

  const fetchClients = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('fecha_inscripcion', { ascending: false })
    if (error) toast.error('Error al cargar clientes')
    else setClients(data || [])
    setLoading(false)
  }

  const onSubmit = async (formData) => {
    setSaving(true)
    try {
      // Ensure date is properly captured; use today's date if not provided
      const fechaInscripcion = formData.fechaInscripcion && formData.fechaInscripcion.trim()
        ? formData.fechaInscripcion
        : format(new Date(), 'yyyy-MM-dd')
      const tipoPago = formData.tipoPago || 'inscripcion_mensual'
      const descuento = Number(formData.descuento) || 0

      // 1. Create client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          fecha_inscripcion: fechaInscripcion,
          estado: 'activo'
        })
        .select()
        .single()
      if (clientError) throw clientError

      // 2. Create payment(s) based on type — cada pago tiene su propia nota
      const pagosACrear = []
      let montoTotal = 0

      if (tipoPago === 'inscripcion_mensual') {
        pagosACrear.push({ tipo: 'inscripcion', monto: PRECIOS_BASE.inscripcion, nota: `Inscripción $${PRECIOS_BASE.inscripcion.toFixed(2)}` })
        pagosACrear.push({ tipo: 'mensual',     monto: PRECIOS_BASE.mensual,     nota: `Mensual $${PRECIOS_BASE.mensual.toFixed(2)}` })
        montoTotal = PRECIOS_BASE.inscripcion + PRECIOS_BASE.mensual
      } else if (tipoPago === 'solo_mensual') {
        pagosACrear.push({ tipo: 'mensual', monto: PRECIOS_BASE.mensual, nota: `Mensual $${PRECIOS_BASE.mensual.toFixed(2)}` })
        montoTotal = PRECIOS_BASE.mensual
      } else if (tipoPago === 'solo_diario') {
        pagosACrear.push({ tipo: 'diario', monto: PRECIOS_BASE.diario, nota: `Diario $${PRECIOS_BASE.diario.toFixed(2)}` })
        montoTotal = PRECIOS_BASE.diario
      } else if (tipoPago === 'solo_inscripcion') {
        pagosACrear.push({ tipo: 'inscripcion', monto: PRECIOS_BASE.inscripcion, nota: `Inscripción $${PRECIOS_BASE.inscripcion.toFixed(2)}` })
        montoTotal = PRECIOS_BASE.inscripcion
      }

      // Aplicar descuento al pago más grande primero (mensual → inscripcion)
      // La nota de cada pago afectado se actualiza para reflejar el monto real cobrado
      if (descuento > 0 && pagosACrear.length > 0) {
        let restante = descuento
        for (let i = pagosACrear.length - 1; i >= 0 && restante > 0; i--) {
          const reduccion = Math.min(restante, pagosACrear[i].monto)
          const original = pagosACrear[i].monto
          pagosACrear[i].monto = parseFloat((original - reduccion).toFixed(2))
          pagosACrear[i].nota = `${pagosACrear[i].nota} — desc. -$${reduccion.toFixed(2)} → cobra $${pagosACrear[i].monto.toFixed(2)}`
          restante = parseFloat((restante - reduccion).toFixed(2))
        }
      }

      const montoFinal = pagosACrear.reduce((sum, p) => sum + p.monto, 0)

      // Insert all payments con notas individuales
      if (pagosACrear.length > 0) {
        const pagosParaInsert = pagosACrear.map((pago) => ({
          client_id: client.id,
          tipo: pago.tipo,
          monto: pago.monto,
          fecha_pago: fechaInscripcion,
          mes_correspondiente: fechaInscripcion.substring(0, 7),
          notas: pago.nota,
        }))

        const { error: pagoError } = await supabase.from('payments').insert(pagosParaInsert)
        if (pagoError) throw pagoError
      }

      // 3. Create membership if includes 'mensual'
      if (tipoPago === 'inscripcion_mensual' || tipoPago === 'solo_mensual') {
        const vencimiento = new Date(fechaInscripcion)
        vencimiento.setMonth(vencimiento.getMonth() + 1)

        await supabase.from('memberships').insert({
          client_id: client.id,
          tipo: 'mensual',
          fecha_inicio: fechaInscripcion,
          fecha_vencimiento: format(vencimiento, 'yyyy-MM-dd'),
          estado: 'activa',
        })
      }

      const mensajeExito = montoFinal > 0
        ? `✅ Cliente registrado — $${montoFinal.toFixed(2)} cobrado`
        : '✅ Cliente registrado sin pago inicial'

      toast.success(mensajeExito)
      reset()
      setShowModal(false)
      fetchClients()
    } catch (err) {
      const msg = err?.message || ''
      if (msg.includes('clients_email_key') || (msg.includes('unique') && msg.includes('email'))) {
        setError('email', { message: 'Ya existe un cliente con este correo' })
      } else if (msg.includes('clients_telefono') || (msg.includes('unique') && msg.includes('telefono'))) {
        setError('telefono', { message: 'Ya existe un cliente con este teléfono' })
      }
      toast.error(getFriendlyError(err))
    }
    setSaving(false)
  }

  const toggleEstado = async (client) => {
    const nuevoEstado = client.estado === 'activo' ? 'inactivo' : 'activo'
    const { error } = await supabase.from('clients').update({ estado: nuevoEstado }).eq('id', client.id)
    if (error) toast.error('Error al actualizar')
    else {
      toast.success(`Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`)
      fetchClients()
    }
  }

  const verPagos = async (client) => {
    setShowPagos(client)
    setActiveTab('pagos')
    const [p, a] = await Promise.all([
      supabase
        .from('payments')
        .select('id, client_id, tipo, monto, fecha_pago, notas, clients(id, nombre, apellido, email, telefono), promotions(nombre)')
        .eq('client_id', client.id)
        .order('fecha_pago', { ascending: false }),
      supabase
        .from('attendance')
        .select('*')
        .eq('client_id', client.id)
        .order('fecha', { ascending: false }),
    ])
    setPagos(p.data || [])
    setAsistencias(a.data || [])
  }

  const addPartialPayment = async () => {
    if (!partialPaymentAmount || Number(partialPaymentAmount) <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }

    if (!showPagos) return

    setLoadingPartialPayment(true)
    try {
      const { error } = await supabase.from('payments').insert({
        client_id: showPagos.id,
        tipo: 'pago_parcial',
        monto: Number(partialPaymentAmount),
        fecha_pago: format(new Date(), 'yyyy-MM-dd'),
        mes_correspondiente: format(new Date(), 'yyyy-MM'),
        notas: `Pago parcial - $${Number(partialPaymentAmount).toFixed(2)}`
      })

      if (error) throw error

      toast.success(`Pago parcial de $${Number(partialPaymentAmount).toFixed(2)} registrado`)
      setPartialPaymentAmount('')
      verPagos(showPagos)
    } catch (err) {
      toast.error(err.message || 'Error al registrar pago parcial')
    }
    setLoadingPartialPayment(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Clientes</h2>
          <p className="text-gym-gray text-xs sm:text-sm mt-1">{clients.length} registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center sm:justify-start gap-2 bg-gym-red hover:bg-gym-red-hover text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl btn-interactive text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Nuevo cliente</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-gray flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gym-dark border border-white/10 rounded-lg sm:rounded-xl pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-white text-sm placeholder-gym-gray focus:outline-none focus:border-gym-red transition-colors"
        />
      </div>

      {/* Desktop Table / Mobile Cards */}
      <div className="bg-gym-dark border border-white/5 rounded-lg sm:rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <div className="w-8 h-8 border-4 border-gym-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Inscripción</th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Estado</th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Membresía</th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-gym-gray text-xs font-semibold uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client) => {
                    return (
                    <tr
                      key={client.id}
                      id={`row-${client.id}`}
                      className={`border-b border-white/5 hover:bg-white/2 transition-all ${
                        client.id === highlightId ? 'bg-gym-red/10 outline outline-1 outline-gym-red/50' : ''
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="font-semibold text-white text-xs sm:text-sm">{client.nombre} {client.apellido}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gym-gray text-xs sm:text-sm truncate">{client.email}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gym-gray text-xs">
                        {client.fecha_inscripcion ? format(new Date(client.fecha_inscripcion), 'dd MMM yy', { locale: es }) : '—'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${client.estado === 'activo' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {client.estado}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="text-xs font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap bg-gray-500/10 text-gray-400">
                          Verificar
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button onClick={() => verPagos(client)} className="p-1.5 text-gym-gray hover:text-white btn-icon" title="Ver pagos">
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleEstado(client)} className="p-1.5 text-gym-gray hover:text-white btn-icon" title="Cambiar estado">
                            {client.estado === 'activo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 sm:py-12 text-gym-gray text-sm">No se encontraron clientes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-2 p-3">
              {filtered.map((client) => {
                const membershipStatus = getMembershipStatus(client.id)
                return (
                  <div key={client.id} id={`row-${client.id}`} className={`bg-gym-black rounded-lg p-3 space-y-2 ${client.id === highlightId ? 'border-2 border-gym-red' : 'border border-white/5'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm truncate">{client.nombre} {client.apellido}</div>
                        <div className="text-gym-gray text-xs mt-1 truncate">{client.email}</div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${client.estado === 'activo' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {client.estado}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gym-gray">Inscripción</span>
                      <span className="text-white">{client.fecha_inscripcion ? format(new Date(client.fecha_inscripcion), 'dd MMM yy', { locale: es }) : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gym-gray">Membresía</span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400">Verificar</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button onClick={() => verPagos(client)} className="flex-1 p-2 text-xs text-gym-gray hover:text-white hover:bg-white/5 rounded btn-icon flex items-center justify-center gap-1" title="Ver pagos">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pagos</span>
                      </button>
                      <button onClick={() => toggleEstado(client)} className="flex-1 p-2 text-xs text-gym-gray hover:text-white hover:bg-white/5 rounded btn-icon flex items-center justify-center gap-1" title="Cambiar estado">
                        {client.estado === 'activo' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>{client.estado === 'activo' ? 'Desactivar' : 'Activar'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gym-gray text-sm">No se encontraron clientes</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal: New Client */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gym-dark border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Nuevo Cliente</h3>
              <button onClick={() => { setShowModal(false); reset() }} className="text-gym-gray hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gym-gray text-xs mb-1">Nombre</label>
                  <input
                    {...register('nombre', { required: true })}
                    className="w-full bg-gym-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-red"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-gym-gray text-xs mb-1">Apellido</label>
                  <input
                    {...register('apellido', { required: true })}
                    className="w-full bg-gym-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-red"
                    placeholder="Pérez"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gym-gray text-xs mb-1">Correo electrónico</label>
                <input
                  {...register('email', { required: 'El correo es obligatorio' })}
                  type="email"
                  className={`w-full bg-gym-black border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-red ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="juan@email.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-gym-gray text-xs mb-1">Teléfono (opcional)</label>
                <Controller
                  name="telefono"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value) return true
                      // Quitar el código de país para validar solo el número local
                      const codigoMatch = COUNTRY_CODES.find(cc => value.startsWith(cc.code))
                      const numeroLocal = codigoMatch
                        ? value.slice(codigoMatch.code.length).replace(/\D/g, '')
                        : value.replace(/\D/g, '')
                      if (numeroLocal.length < 8)
                        return 'El teléfono debe tener al menos 8 dígitos'
                      return true
                    }
                  }}
                  render={({ field }) => <PhoneInputWithCode field={field} />}
                />
                {errors.telefono && (
                  <p className="text-red-400 text-xs mt-1">{errors.telefono.message}</p>
                )}
              </div>

              {/* Payment Type Selection */}
              <div>
                <label className="block text-gym-gray text-xs mb-1">Tipo de pago inicial</label>
                <select
                  {...register('tipoPago', { required: true })}
                  className="w-full bg-gym-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-red"
                >
                  <option value="inscripcion_mensual">Inscripción + Mensual ($30)</option>
                  <option value="solo_mensual">Solo Mensual ($25)</option>
                  <option value="solo_diario">Solo Diario ($3)</option>
                  <option value="solo_inscripcion">Solo Inscripción ($5)</option>
                  <option value="sin_pago">Sin pago inicial</option>
                </select>
              </div>

              {/* Registration Date */}
              <div>
                <label className="block text-gym-gray text-xs mb-1">Fecha de inscripción</label>
                <Controller
                  name="fechaInscripcion"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <input
                        {...field}
                        type="date"
                        className="w-full bg-gym-black border border-white/10 rounded-lg px-3 py-2.5 pl-10 text-white text-sm focus:outline-none focus:border-gym-red"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-gray pointer-events-none" />
                    </div>
                  )}
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-gym-gray text-xs mb-1">Descuento ($)</label>
                <input
                  {...register('descuento')}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full bg-gym-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-red"
                  placeholder="0.00"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gym-red hover:bg-gym-red-hover disabled:opacity-50 text-white font-bold py-3 rounded-xl btn-interactive mt-4"
              >
                {saving ? 'Registrando...' : 'Registrar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Payment history + Attendance */}
      {showPagos && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gym-dark border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg">
                  Historial — {showPagos.nombre} {showPagos.apellido}
                </h3>
                <p className="text-gym-gray text-xs mt-1">{showPagos.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    sendWhatsApp(
                      showPagos.telefono,
                      `Hola ${showPagos.nombre}, ¿cómo estás? Te escribo de Body Health Gym. 💪`
                    )
                  }
                  title={showPagos.telefono ? 'Enviar WhatsApp' : 'Sin teléfono registrado'}
                  className={`p-2 rounded-lg btn-icon flex-shrink-0 ${
                    showPagos.telefono
                      ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      : 'bg-gray-500/10 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button onClick={() => setShowPagos(null)} className="text-gym-gray hover:text-white btn-icon">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 mb-6 bg-gym-black rounded-xl p-1">
              {[
                ['pagos', '💳 Pagos'],
                ['asistencias', '📋 Asistencias'],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg nav-interactive ${
                    activeTab === tab ? 'bg-gym-red text-white' : 'text-gym-gray hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Pagos Tab */}
            {activeTab === 'pagos' && (
              <>
                {pagos.length === 0 ? (
                  <p className="text-gym-gray text-center py-8">Sin pagos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {pagos.map((pago) => (
                      <div key={pago.id} className="bg-gym-black border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-semibold capitalize">{pago.tipo}</div>
                          <div className="text-gym-gray text-xs mt-0.5">
                            {format(new Date(pago.fecha_pago), 'dd MMM yyyy', { locale: es })}
                            {pago.promotions && <span className="ml-2 text-gym-red">· {pago.promotions.nombre}</span>}
                          </div>
                          {pago.notas && <div className="text-gym-gray text-xs mt-0.5 italic">{pago.notas}</div>}
                        </div>
                        <div className="text-gym-red font-black text-lg">${Number(pago.monto).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Partial Payment Section */}
                <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                  <h4 className="text-white font-bold text-sm">Registrar Pago Parcial</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={partialPaymentAmount}
                      onChange={(e) => setPartialPaymentAmount(e.target.value)}
                      placeholder="Monto ($)"
                      className="flex-1 bg-gym-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gym-red"
                    />
                    <button
                      onClick={addPartialPayment}
                      disabled={loadingPartialPayment}
                      className="bg-gym-red hover:bg-gym-red-hover disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg btn-interactive text-sm"
                    >
                      {loadingPartialPayment ? 'Guardando...' : 'Registrar'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Asistencias Tab */}
            {activeTab === 'asistencias' && (
              <>
                {asistencias.length === 0 ? (
                  <p className="text-gym-gray text-center py-8">Sin asistencias registradas</p>
                ) : (
                  <div className="space-y-3">
                    {asistencias.map((asist) => (
                      <div key={asist.id} className="bg-gym-black border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-semibold">
                            {format(new Date(asist.fecha), 'dd MMM yyyy', { locale: es })}
                          </div>
                          <div className="text-gym-gray text-xs mt-0.5">{asist.hora}</div>
                        </div>
                        <ClipboardList className="w-4 h-4 text-gym-red" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
