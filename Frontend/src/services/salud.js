import api from './api'

// Render apaga la instancia gratuita tras 15 minutos sin tráfico. La primera
// petición que llega después no falla: se queda colgada hasta que el contenedor
// arranca, cerca de un minuto.
//
// El timeout tiene que ser holgado. Abortar del lado del navegador no cancela el
// trabajo del servidor: la petición sigue viva allí, esperando su conexión a la
// base. Con un timeout corto, cada reintento apila una petición más que nadie
// recoge, y el hilo y la conexión se quedan retenidos. Vale más esperar de sobra
// y preguntar poco que declarar "dormido" un servidor que solo iba lento.
const TIMEOUT_SONDA_MS = 30000
const REINTENTO_MS = 8000
const ESPERA_MAXIMA_MS = 180000

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
