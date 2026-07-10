import api from './api'

export async function preguntarAsistente(pregunta) {
  const { data } = await api.post('/asistente/preguntar', { pregunta })
  return data
}
