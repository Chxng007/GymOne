import api from './api'

export async function registrarClientePublico(payload) {
  const { data } = await api.post('/registro-publico', payload)
  return data
}
