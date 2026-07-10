import api from './api'

export async function listarPagos(clienteId) {
  const { data } = await api.get('/pagos', { params: clienteId ? { clienteId } : {} })
  return data
}

export async function crearPago(payload) {
  const { data } = await api.post('/pagos', payload)
  return data
}

export async function notificarPago(id) {
  const { data } = await api.post(`/pagos/${id}/notificar`)
  return data
}
