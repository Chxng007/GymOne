import api from './api'

export async function obtenerConfiguracion() {
  const { data } = await api.get('/configuracion')
  return data
}

export async function actualizarConfiguracion(payload) {
  const { data } = await api.put('/configuracion', payload)
  return data
}
