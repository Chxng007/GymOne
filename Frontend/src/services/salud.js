import api from './api'

// Render apaga la instancia gratuita tras 15 minutos sin tráfico. La primera
// petición que llega después no falla: se queda colgada hasta que el contenedor
// arranca, cerca de un minuto. Un timeout corto separa "dormido" de "listo" sin
// estorbar ese arranque, que ya va por su cuenta del lado de Render.
const TIMEOUT_SONDA_MS = 8000
const REINTENTO_MS = 3000
const ESPERA_MAXIMA_MS = 150000

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Una respuesta cualquiera, incluido el 503 de base caída, significa que la API
 * está en pie. Solo el silencio (timeout o red) cuenta como servidor dormido.
 */
export async function backendDespierto() {
  try {
    await api.get('/salud', { timeout: TIMEOUT_SONDA_MS })
    return true
  } catch (error) {
    return Boolean(error.response)
  }
}

/**
 * Sondea hasta que el backend contesta. Devuelve false si agota la espera, para
 * que la interfaz pueda decir que está caído en vez de girar para siempre.
 * `sigueVivo` corta el bucle cuando el componente que lo llamó se desmonta.
 */
export async function esperarBackend(sigueVivo = () => true) {
  const limite = Date.now() + ESPERA_MAXIMA_MS

  while (Date.now() < limite) {
    if (!sigueVivo()) return false
    if (await backendDespierto()) return true
    await dormir(REINTENTO_MS)
  }

  return false
}
