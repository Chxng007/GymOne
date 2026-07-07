import api from './api'

export async function listarAsistenciaHoy() {
  const { data } = await api.get('/asistencias')
  return data
}

export async function listarAsistenciaPorCliente(clienteId) {
  const { data } = await api.get('/asistencias', { params: { clienteId } })
  return data
}

export async function registrarEntrada(clienteId) {
  const { data } = await api.post('/asistencias/entrada', null, { params: { clienteId } })
  return data
}

export async function registrarSalida(asistenciaId) {
  const { data } = await api.post(`/asistencias/${asistenciaId}/salida`)
  return data
}
