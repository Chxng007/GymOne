import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ICONS = {
  dashboard: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  clientes: 'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M5.5 20a6.5 6.5 0 0 1 13 0',
  membresias: 'M3 6h18v12H3z M3 10h18 M7 15h4',
  pagos: 'M4 12a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M12 8v8 M9.3 10.2c0-1.2 1.1-1.7 2.7-1.7s2.7.6 2.7 1.7-1.1 1.3-2.7 1.3-2.7.5-2.7 1.7 1.1 1.7 2.7 1.7 2.7-.5 2.7-1.7',
  caja: 'M4 8h16v11H4z M4 8l2-4h12l2 4 M9 13h2 M13 13h2',
  asistencia: 'M4 5h16v15H4z M4 9h16 M8 3v4 M16 3v4 M8.5 14l2 2 4-4',
  inventario: 'M3 8l9-5 9 5-9 5-9-5Z M3 8v9l9 5 9-5V8 M12 13v9',
  ventas: 'M4 16l5-5 4 4 7-7 M15 8h5v5',
  gastos: 'M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3Z M9 8h6 M9 12h6',
  entrenadores: 'M4 12h2 M18 12h2 M6 9v6 M18 9v6 M8 12h8',
  reportes: 'M4 20V10 M10 20V4 M16 20v-8 M2 20h20',
  configuracion: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M12 4v2 M12 18v2 M4 12h2 M18 12h2 M6.3 6.3l1.4 1.4 M16.3 16.3l1.4 1.4 M6.3 17.7l1.4-1.4 M16.3 7.7l1.4-1.4',
}

const ROLES_ADMIN = ['ADMINISTRADOR']
const ROLES_ADMIN_RECEPCION = ['ADMINISTRADOR', 'RECEPCIONISTA']

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/clientes', label: 'Clientes', icon: 'clientes' },
  { to: '/membresias', label: 'Membresías', icon: 'membresias' },
  { to: '/pagos', label: 'Pagos', icon: 'pagos', roles: ROLES_ADMIN_RECEPCION },
  { to: '/caja', label: 'Caja', icon: 'caja', roles: ROLES_ADMIN_RECEPCION },
  { to: '/asistencia', label: 'Asistencia', icon: 'asistencia' },
  { to: '/inventario', label: 'Inventario', icon: 'inventario' },
  { to: '/ventas', label: 'Ventas', icon: 'ventas', roles: ROLES_ADMIN_RECEPCION },
  { to: '/gastos', label: 'Gastos', icon: 'gastos', roles: ROLES_ADMIN },
  { to: '/entrenadores', label: 'Entrenadores', icon: 'entrenadores' },
  { to: '/reportes', label: 'Reportes', icon: 'reportes', roles: ROLES_ADMIN_RECEPCION },
]

const CONFIGURACION_ITEM = { to: '/configuracion', label: 'Configuración', icon: 'configuracion', roles: ROLES_ADMIN }

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function NavIcon({ d, color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}

function navItemStyle(isActive) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 14px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
    background: isActive ? 'var(--color-surface-alt)' : 'transparent',
    textDecoration: 'none',
  }
}

export function Sidebar() {
  const { user } = useAuth()
  const navItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.rol))
  const mostrarConfiguracion = !CONFIGURACION_ITEM.roles || CONFIGURACION_ITEM.roles.includes(user?.rol)

  return (
    <aside
      style={{
        width: 236,
        flexShrink: 0,
        background: 'var(--color-sidebar-bg)',
        borderRight: '1px solid var(--color-border-subtle)',
        padding: '22px 0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 22px', marginBottom: 28 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#00243a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M6 6h6M6 6v6M18 18h-6M18 18v-6" />
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: 'var(--color-text)', lineHeight: 1.15 }}>
            GymOne
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>Management Pro</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="ui-nav-item" style={({ isActive }) => navItemStyle(isActive)}>
            {({ isActive }) => (
              <>
                <NavIcon d={ICONS[item.icon]} color={isActive ? 'var(--color-accent)' : '#8390ac'} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        {mostrarConfiguracion && (
          <NavLink to={CONFIGURACION_ITEM.to} className="ui-nav-item" style={({ isActive }) => navItemStyle(isActive)}>
            {({ isActive }) => (
              <>
                <NavIcon d={ICONS.configuracion} color={isActive ? 'var(--color-accent)' : '#8390ac'} />
                {CONFIGURACION_ITEM.label}
              </>
            )}
          </NavLink>
        )}
      </nav>

      <div
        style={{
          margin: '16px 12px 0',
          padding: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {initialsOf(user?.nombre) || 'AD'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.nombre ?? 'Administrador'}
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 11.5, textTransform: 'capitalize' }}>{user?.rol?.toLowerCase() ?? 'GymOne Central'}</div>
        </div>
      </div>
    </aside>
  )
}
