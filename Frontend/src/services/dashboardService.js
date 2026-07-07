import api from './api'

export async function obtenerResumenDashboard() {
  const { data } = await api.get('/dashboard/resumen')
  return data
}
