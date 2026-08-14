import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ChatWidget } from './ChatWidget'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

// El backend rechaza toda escritura del invitado. Avisarlo por adelantado evita
// que un botón que no guarda nada se lea como una avería.
function AvisoInvitado() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 32px',
        background: 'rgba(56,189,248,0.09)',
        borderBottom: '1px solid rgba(56,189,248,0.22)',
        color: 'var(--color-text-secondary)',
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      <span aria-hidden="true">👁️</span>
      <span>
        <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>Modo invitado.</strong> Podés recorrer toda la
        plataforma, pero los cambios no se guardan.
      </span>
    </div>
  )
}

export function AppLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const { user } = useAuth()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        {user?.invitado && <AvisoInvitado />}
        <main style={{ flex: 1, padding: '30px 32px 60px', overflow: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}
