import axios from 'axios'
import { TOKEN_KEY, USER_KEY } from '../context/AuthContext'
import { anotarBloqueoInvitado } from './sesionInvitado'

// La API cuelga siempre de /api. Aceptamos VITE_API_URL con o sin ese sufijo
// porque el valor puede venir de dos sitios que no siempre coinciden: el
// .env.production del repo y las variables del panel de Vercel, que lo pisan.
function resolverBaseURL() {
  const raw = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
  if (!raw) return '/api'
  return raw.endsWith('/api') ? raw : `${raw}/api`
}

const api = axios.create({
  baseURL: resolverBaseURL(),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.codigo === 'INVITADO_SOLO_LECTURA') {
      anotarBloqueoInvitado(error.response.data.error)
    }

    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)
      window.location.replace('/login?sesion=expirada')
    }
    return Promise.reject(error)
  },
)

export default api
