import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/Avatar'
import { Drawer } from '../ui/Drawer'
import { NotificacionesPanel } from './NotificacionesPanel'
import { obtenerNotificaciones } from '../../services/notificacionesService'

const POLL_MS = 60000

export function Topbar({ searchPlaceholder = 'Buscar miembros, transacciones o clases...' }) {
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
        height: 68,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '0 32px',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: 460,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-input)',
          borderRadius: 10,
          padding: '10px 16px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{searchPlaceholder}</span>
      </div>

      <div style={{ flex: 1 }} />

      <NavLink
        to="/configuracion"
        className="ui-icon-btn"
        aria-label="Configuración"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 9, color: 'var(--color-text-secondary)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.6A9 9 0 1 1 11.4 3a7 7 0 0 0 9.6 9.6Z" />
        </svg>
      </NavLink>

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
          width: 36,
          height: 36,
          background: 'transparent',
          border: 'none',
          borderRadius: 9,
          cursor: 'pointer',
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="var(--color-text-secondary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="var(--color-text-secondary)" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {pendientes > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--color-danger)',
            }}
          />
        )}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Notificaciones">
        <NotificacionesPanel notificaciones={notificaciones} onLeida={handleLeida} />
      </Drawer>

      <div style={{ width: 1, height: 24, background: 'var(--color-border-input)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--color-accent)', fontSize: 14, fontWeight: 600 }}>{user?.nombre}</span>
        <Avatar name={user?.nombre} size={30} />
      </div>

      <button
        type="button"
        onClick={logout}
        className="ui-hover-accent"
        style={{
          background: 'transparent',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border-input)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 14px',
          fontSize: 13,
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
