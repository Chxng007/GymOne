import api from './api'

export async function listarRutinasPorCliente(clienteId) {
  const { data } = await api.get('/rutinas', { params: { clienteId } })
  return data
}

export async function crearRutina(payload) {
  const { data } = await api.post('/rutinas', payload)
  return data
}

export async function eliminarRutina(id) {
  await api.delete(`/rutinas/${id}`)
}
