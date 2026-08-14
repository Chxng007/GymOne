import { createContext, useCallback, useContext, useState } from 'react'
import { ToastStack } from '../components/ui/Toast'
import { tomarBloqueoInvitado } from '../services/sesionInvitado'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, variant = 'neutral', duration = 3000) => {
    // Si el backend acaba de rechazar una escritura por modo invitado, la página
    // está a punto de anunciar un fallo que no ocurrió. Se sustituye por el
    // motivo real, y en tono de aviso en vez de error.
    const bloqueo = variant === 'danger' ? tomarBloqueoInvitado() : null

    const id = Date.now() + Math.random()
    setToasts((current) => [...current, {
      id,
      message: bloqueo ?? message,
      variant: bloqueo ? 'warning' : variant,
    }])
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}
