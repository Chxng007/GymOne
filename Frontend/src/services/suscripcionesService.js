import api from './api'

export async function listarSuscripcionesPorCliente(clienteId) {
  const { data } = await api.get('/suscripciones', { params: { clienteId } })
  return data
}

export async function listarTodasSuscripciones() {
  const { data } = await api.get('/suscripciones')
  return data
}

export async function crearSuscripcion(payload) {
  const { data } = await api.post('/suscripciones', payload)
  return data
}

export async function congelarSuscripcion(id) {
  const { data } = await api.post(`/suscripciones/${id}/congelar`)
  return data
}

export async function renovarSuscripcion(id) {
  const { data } = await api.post(`/suscripciones/${id}/renovar`)
  return data
}
