import api from './api'

export async function listarPlanes(soloActivos = false) {
  const { data } = await api.get('/planes-membresia', { params: { soloActivos } })
  return data
}

export async function crearPlan(payload) {
  const { data } = await api.post('/planes-membresia', payload)
  return data
}

export async function actualizarPlan(id, payload) {
  const { data } = await api.put(`/planes-membresia/${id}`, payload)
  return data
}

export async function eliminarPlan(id) {
  await api.delete(`/planes-membresia/${id}`)
}
