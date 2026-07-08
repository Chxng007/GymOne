import api from './api'

export async function obtenerResumenDashboard() {
  const { data } = await api.get('/dashboard/resumen')
  return data
}

export async function obtenerTendenciaDashboard() {
  const { data } = await api.get('/dashboard/tendencia')
  return data
}
