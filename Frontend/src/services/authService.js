import api from './api'

export async function login(correo, contrasena) {
  const { data } = await api.post('/auth/login', { correo, contrasena })
  return data
}

// Entra como invitado sin enviar credenciales. Responde 404 si el despliegue
// tiene el acceso de demostración desactivado.
export async function loginDemo() {
  const { data } = await api.post('/auth/demo')
  return data
}

export async function getMe() {
  const { data } = await api.get('/usuarios/me')
  return data
}
