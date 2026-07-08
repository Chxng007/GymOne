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
        height: 64,
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 18,
        padding: '0 32px',
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Notificaciones"
        className="ui-icon-btn"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          background: 'transparent',
          border: 'none',
          borderRadius: 9,
          cursor: 'pointer',
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="#9a9a9a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#9a9a9a" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {pendientes > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 3,
              right: 4,
              background: 'var(--color-primary)',
              color: 'var(--color-bg)',
              boxShadow: '0 0 6px rgba(57,255,20,0.8)',
              borderRadius: 999,
              fontSize: 10,
              lineHeight: 1,
              padding: '3px 5px',
              fontWeight: 700,
              minWidth: 14,
              textAlign: 'center',
            }}
          >
            {pendientes}
          </span>
        )}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Notificaciones">
        <NotificacionesPanel notificaciones={notificaciones} onLeida={handleLeida} />
      </Drawer>

      <span style={{ color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 500 }}>{user?.nombre}</span>
      <button
        type="button"
        onClick={logout}
        className="ui-hover-accent"
        style={{
          background: 'transparent',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border-input)',
          borderRadius: 'var(--radius-sm)',
          padding: '9px 16px',
          fontSize: 13.5,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        Cerrar sesión
      </button>
    </header>
  )
}
