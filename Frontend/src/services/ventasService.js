import api from './api'

export async function listarVentas() {
  const { data } = await api.get('/ventas')
  return data
}

export async function crearVenta(payload) {
  const { data } = await api.post('/ventas', payload)
  return data
}
