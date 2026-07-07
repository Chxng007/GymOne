import { useAuth } from '../../context/AuthContext'

export function Topbar() {
  const { user, logout } = useAuth()

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
