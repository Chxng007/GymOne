import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Drawer } from '../ui/Drawer'
import { NotificacionesPanel } from './NotificacionesPanel'
import { obtenerNotificaciones } from '../../services/notificacionesService'

const POLL_MS = 60000

export function Topbar() {
  const { user, logout } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    function cargar() {
      obtenerNotificaciones()
        .then((data) => { if (!cancelled) setNotificaciones(data) })
        .catch(() => {})
    }

    cargar()
    const interval = setInterval(cargar, POLL_MS)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const pendientes = notificaciones.filter((n) => !n.leida).length

  function handleLeida(id) {
    setNotificaciones((current) => current.map((n) => (n.id === id ? { ...n, leida: true } : n)))
  }

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
        padding: 'var(--spacing-3)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Notificaciones"
        style={{
          position: 'relative',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text)',
          padding: '6px 10px',
          cursor: 'pointer',
        }}
      >
        🔔
        {pendientes > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'var(--color-danger)',
              color: '#fff',
              borderRadius: 999,
              fontSize: 11,
              lineHeight: 1,
              padding: '3px 6px',
              fontWeight: 700,
            }}
          >
            {pendientes}
          </span>
        )}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Notificaciones">
        <NotificacionesPanel notificaciones={notificaciones} onLeida={handleLeida} />
      </Drawer>

      <span style={{ color: 'var(--color-text-muted)' }}>{user?.nombre}</span>
      <button
        type="button"
        onClick={logout}
        style={{
          background: 'var(--color-surface-alt)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px',
          cursor: 'pointer',
        }}
      >
        Cerrar sesión
      </button>
    </header>
  )
}
