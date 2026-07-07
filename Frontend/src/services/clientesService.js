import api from './api'

export async function listarClientes(busqueda) {
  const { data } = await api.get('/clientes', { params: busqueda ? { busqueda } : {} })
  return data
}

export async function obtenerCliente(id) {
  const { data } = await api.get(`/clientes/${id}`)
  return data
}

export async function crearCliente(payload) {
  const { data } = await api.post('/clientes', payload)
  return data
}

export async function actualizarCliente(id, payload) {
  const { data } = await api.put(`/clientes/${id}`, payload)
  return data
}

export async function eliminarCliente(id) {
  await api.delete(`/clientes/${id}`)
}
