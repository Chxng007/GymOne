import { Badge } from '../ui/Badge'
import { marcarNotificacionLeida } from '../../services/notificacionesService'

const TIPO_LABELS = {
  VENCIMIENTO: { label: 'Vencimiento', variant: 'warning' },
  STOCK_BAJO: { label: 'Stock bajo', variant: 'danger' },
  CAJA_ABIERTA: { label: 'Caja abierta', variant: 'danger' },
  PAGO_PENDIENTE: { label: 'Pago pendiente', variant: 'warning' },
}

export function NotificacionesPanel({ notificaciones, onLeida }) {
  async function handleClick(notificacion) {
    if (notificacion.leida) return
    onLeida(notificacion.id)
    try {
      await marcarNotificacionLeida(notificacion.id)
    } catch {
      // el próximo refresco periódico corrige el estado si falla
    }
  }

  if (notificaciones.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)' }}>No hay notificaciones.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      {notificaciones.map((n) => {
        const tipo = TIPO_LABELS[n.tipo] ?? { label: n.tipo, variant: 'neutral' }
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => handleClick(n)}
            style={{
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: n.leida ? 'transparent' : 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-2)',
              cursor: n.leida ? 'default' : 'pointer',
              color: 'var(--color-text)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge variant={tipo.variant}>{tipo.label}</Badge>
              {!n.leida && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />}
            </div>
            <span style={{ fontSize: 14 }}>{n.mensaje}</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {new Date(n.createdAt).toLocaleString('es-CO')}
            </span>
          </button>
        )
      })}
    </div>
  )
}
