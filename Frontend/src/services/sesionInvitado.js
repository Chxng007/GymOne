// Puente entre el interceptor de axios y el sistema de toasts.
//
// Las páginas capturan sus errores con un texto fijo ("No se pudo eliminar el
// cliente") y descartan el que manda el backend. Para el invitado ese texto
// miente: no falló nada, simplemente no está permitido. Aquí el interceptor
// deja anotado el rechazo y ToastContext lo usa para sustituir ese mensaje.

const VENTANA_MS = 2000

let bloqueo = null

export function anotarBloqueoInvitado(mensaje) {
  bloqueo = { mensaje, en: Date.now() }
}

/**
 * Devuelve el mensaje del último rechazo por modo invitado, o null si no hubo
 * ninguno reciente. Lo consume: solo puede reclamarlo el primero que pregunte,
 * para no reescribir errores ajenos que vengan después.
 */
export function tomarBloqueoInvitado() {
  if (!bloqueo) return null

  const { mensaje, en } = bloqueo
  bloqueo = null

  return Date.now() - en < VENTANA_MS ? mensaje : null
}
