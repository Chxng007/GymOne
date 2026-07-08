import api from './api'

export async function obtenerNotificaciones() {
  const { data } = await api.get('/notificaciones')
  return data
}

export async function marcarNotificacionLeida(id) {
  await api.post(`/notificaciones/${id}/leer`)
}
