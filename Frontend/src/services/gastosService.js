import api from './api'

export async function listarGastos() {
  const { data } = await api.get('/gastos')
  return data
}

export async function crearGasto(payload) {
  const { data } = await api.post('/gastos', payload)
  return data
}

export async function eliminarGasto(id) {
  await api.delete(`/gastos/${id}`)
}
