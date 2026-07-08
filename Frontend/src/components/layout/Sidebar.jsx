import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/membresias', label: 'Membresías' },
  { to: '/pagos', label: 'Pagos' },
  { to: '/caja', label: 'Caja' },
  { to: '/asistencia', label: 'Asistencia' },
  { to: '/inventario', label: 'Inventario' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/gastos', label: 'Gastos' },
  { to: '/entrenadores', label: 'Entrenadores' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/configuracion', label: 'Configuración' },
]

export function Sidebar() {
  return (
    <aside
      style={{
        width: 222,
        flexShrink: 0,
        background: 'var(--color-bg)',
        borderRight: '1px solid var(--color-border-subtle)',
        padding: '26px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 24px', marginBottom: 26 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: 'linear-gradient(135deg, var(--color-primary), #00FF7F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(57,255,20,0.4)',
            flexShrink: 0,
          }}
        >
          <div style={{ width: 9, height: 9, background: 'var(--color-bg)', borderRadius: 2, transform: 'rotate(45deg)' }} />
        </div>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
          Gym<span style={{ color: 'var(--color-primary)' }}>One</span>
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              textDecoration: 'none',
              padding: '12px 24px',
              fontSize: 14.5,
              fontWeight: isActive ? 700 : 500,
              background: isActive ? 'rgba(57,255,20,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
