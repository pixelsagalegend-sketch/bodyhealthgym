import { supabase } from '../lib/supabase'

export async function logAction({ profileId, accion, entidadTipo = null, entidadId = null, detalles = null }) {
  if (!profileId) return
  await supabase.from('audit_log').insert({
    user_id: profileId,
    accion,
    entidad_tipo: entidadTipo,
    entidad_id: entidadId,
    detalles,
  })
}