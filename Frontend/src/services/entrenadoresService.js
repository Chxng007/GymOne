import api from './api'

export async function listarEntrenadores() {
  const { data } = await api.get('/entrenadores')
  return data
}

export async function crearEntrenador(payload) {
  const { data } = await api.post('/entrenadores', payload)
  return data
}

export async function actualizarEntrenador(id, payload) {
  const { data } = await api.put(`/entrenadores/${id}`, payload)
  return data
}

export async function eliminarEntrenador(id) {
  await api.delete(`/entrenadores/${id}`)
}
