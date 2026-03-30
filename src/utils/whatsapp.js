export const sendWhatsApp = (phone, message) => {
  if (!phone) return
  const clean = phone.replace(/[\s+\-()]/g, '').replace(/[^\d+]/g, '')
  window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
}
