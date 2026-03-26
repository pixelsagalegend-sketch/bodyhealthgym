import { format, subDays } from 'date-fns'

const today = new Date()

// Demo data - empty arrays for new system
export const demoClients = []
export const demoPromotions = []
export const demoPayments = []
export const demoMemberships = []
export const demoAttendance = []

// Helper function to get demo data
export function getDemoData(table) {
  const tables = {
    clients: demoClients,
    payments: demoPayments,
    promotions: demoPromotions,
    memberships: demoMemberships,
  }
  return tables[table] || []
}

// Helper for metrics calculation
export function calculateDemoMetrics() {
  const activeClients = demoClients.filter((c) => c.estado === 'activo').length

  const thisMonth = format(today, 'yyyy-MM')
  const thisMonthPayments = demoPayments.filter((p) => p.mes_correspondiente === thisMonth)
  const income = thisMonthPayments.reduce((sum, p) => sum + Number(p.monto), 0)

  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
  const expiringSoon = demoMemberships.filter((m) => {
    const expireDate = new Date(m.fecha_vencimiento)
    return m.estado === 'activa' && expireDate <= sevenDaysLater && expireDate >= today
  }).length

  return {
    activos: activeClients,
    ingresos: income,
    pendientes: expiringSoon,
    porVencer: expiringSoon,
  }
}

// Monthly income for chart
export function calculateDemoChartData() {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - (5 - i))
    return {
      month: format(d, 'MMM').toUpperCase(),
      monthKey: format(d, 'yyyy-MM'),
    }
  })

  return months.map((m) => {
    const monthPayments = demoPayments.filter((p) => p.mes_correspondiente === m.monthKey)
    const ingresos = monthPayments.reduce((sum, p) => sum + Number(p.monto), 0)
    return { mes: m.month, ingresos }
  })
}

// Calculate membership status
export function getMembershipStatus(clientId) {
  const membership = demoMemberships.find((m) => m.client_id === clientId && m.estado === 'activa')
  if (!membership) return { status: 'sin-membresía', label: 'Sin membresía', color: 'bg-gray-500/10 text-gray-400' }

  const vencDate = new Date(membership.fecha_vencimiento)
  const daysUntilExpiry = Math.floor((vencDate - today) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return { status: 'vencida', label: 'VENCE HOY', color: 'bg-red-500/10 text-red-400' }
  }
  if (daysUntilExpiry === 0) {
    return { status: 'vence-hoy', label: 'VENCE HOY', color: 'bg-red-500/10 text-red-400' }
  }
  if (daysUntilExpiry <= 7) {
    return { status: 'pronto-vence', label: `VENCE EN ${daysUntilExpiry}D`, color: 'bg-yellow-500/10 text-yellow-400' }
  }
  return { status: 'al-dia', label: 'Al día', color: 'bg-green-500/10 text-green-400' }
}

// Get unpaid members (should have paid but haven't)
export function getUnpaidMembers() {
  const thisMonth = format(today, 'yyyy-MM')
  return demoClients.filter((client) => {
    const membership = demoMemberships.find((m) => m.client_id === client.id && m.estado === 'activa')
    if (!membership || membership.tipo !== 'mensual') return false

    // Check if they paid this month
    const paidThisMonth = demoPayments.some(
      (p) => p.client_id === client.id && p.tipo === 'mensual' && p.mes_correspondiente === thisMonth
    )
    return !paidThisMonth && client.estado === 'activo'
  })
}


// Get attendance for today
export function getDemoAttendanceToday() {
  const todayStr = format(today, 'yyyy-MM-dd')
  return demoAttendance.filter((a) => a.fecha === todayStr).sort((a, b) => b.hora.localeCompare(a.hora))
}

// Get attendance for a specific client
export function getDemoAttendanceForClient(clientId) {
  return demoAttendance.filter((a) => a.client_id === clientId).sort((a, b) => {
    if (a.fecha !== b.fecha) return new Date(b.fecha) - new Date(a.fecha)
    return b.hora.localeCompare(a.hora)
  })
}

// Add attendance record (for marking entrada)
export function addDemoAttendance(clientId) {
  const client = demoClients.find((c) => c.id === clientId)
  if (!client) return null

  const now = new Date()
  const fecha = format(now, 'yyyy-MM-dd')
  const hora = format(now, 'HH:mm')

  const newRecord = {
    id: 'att_' + Date.now(),
    client_id: clientId,
    fecha,
    hora,
    created_at: now.toISOString(),
    clients: { nombre: client.nombre, apellido: client.apellido },
  }

  demoAttendance.unshift(newRecord)
  return newRecord
}
