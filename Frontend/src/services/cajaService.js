import api from './api'

export async function obtenerCajaActual() {
  const { data } = await api.get('/caja/actual')
  return data
}

export async function historialCaja() {
  const { data } = await api.get('/caja/sesiones')
  return data
}

export async function abrirCaja(saldoInicial) {
  const { data } = await api.post('/caja/abrir', { saldoInicial })
  return data
}

export async function registrarMovimiento(sesionId, payload) {
  const { data } = await api.post(`/caja/${sesionId}/movimientos`, payload)
  return data
}

export async function cerrarCaja(sesionId) {
  const { data } = await api.post(`/caja/${sesionId}/cerrar`)
  return data
}
