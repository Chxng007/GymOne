import api from './api'

export async function login(correo, contrasena) {
  const { data } = await api.post('/auth/login', { correo, contrasena })
  return data
}

export async function getMe() {
  const { data } = await api.get('/usuarios/me')
  return data
}
