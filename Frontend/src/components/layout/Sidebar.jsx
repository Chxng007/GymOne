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
        width: 220,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: 'var(--spacing-3)',
      }}
    >
      <h2 style={{ fontSize: 18, marginBottom: 'var(--spacing-4)' }}>GymOne</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              textDecoration: 'none',
              padding: 'var(--spacing-2)',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--color-surface-alt)' : 'transparent',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
