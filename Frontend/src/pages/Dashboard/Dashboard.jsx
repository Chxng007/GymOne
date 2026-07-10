import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { AreaChart, BarChart, DonutChart } from '../../components/ui/Charts'
import { Table } from '../../components/ui/Table'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { obtenerResumenDashboard, obtenerTendenciaDashboard } from '../../services/dashboardService'
import { listarPagos } from '../../services/pagosService'
import { listarTodasSuscripciones } from '../../services/suscripcionesService'

function money(value) {
  return `$${Number(value ?? 0).toLocaleString('es-CO')}`
}

function moneyCompact(value) {
  const n = Number(value ?? 0)
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${Math.round(n)}`
}

function diaCorto(fecha) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')
}

function diasRestantes(fechaFin) {
  const ms = new Date(`${fechaFin}T00:00:00`) - new Date(new Date().toDateString())
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

function trendPct(dias, key) {
  if (!dias || dias.length < 2) return null
  const hoy = Number(dias[dias.length - 1][key])
  const ayer = Number(dias[dias.length - 2][key])
  if (ayer === 0) return hoy > 0 ? 100 : 0
  return Math.round(((hoy - ayer) / ayer) * 100)
}

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

function TrendBadge({ pct }) {
  if (pct === null) return null
  const up = pct >= 0
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12.5, fontWeight: 600, color: up ? 'var(--color-success)' : 'var(--color-danger)' }}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  )
}

function StatCard({ icon, iconBg, iconColor, label, value, format, sub }) {
  return (
    <motion.div variants={cardVariants}>
      <Card style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
            {label}
          </span>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon(iconColor)}
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
          <AnimatedNumber value={value} format={format} />
        </div>
        <div style={{ fontSize: 12.5 }}>{sub}</div>
      </Card>
    </motion.div>
  )
}

const IconDinero = (color) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9.5 9.5c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2c0 2.5-5 1.5-5 4 0 1.1 1.1 2 2.5 2s2.5-.9 2.5-2" />
  </svg>
)

const IconUsers = (color) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="8.5" r="2.4" />
    <path d="M15.5 14.2c2.6.5 4.5 2.6 4.5 5.8" />
  </svg>
)

const IconTrend = (color) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V10M10 20V4M16 20v-8M2 20h20" />
  </svg>
)

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [resumen, setResumen] = useState(null)
  const [tendencia, setTendencia] = useState([])
  const [actividad, setActividad] = useState([])
  const [porVencer, setPorVencer] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([obtenerResumenDashboard(), obtenerTendenciaDashboard(), listarPagos(), listarTodasSuscripciones()])
      .then(([r, t, pagos, suscripciones]) => {
        setResumen(r)
        setTendencia(t)
        setActividad(pagos.slice(0, 5))
        setPorVencer(
          suscripciones
            .filter((s) => s.estado === 'ACTIVA' && diasRestantes(s.fechaFin) <= 7)
            .sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin))
            .slice(0, 5),
        )
      })
      .catch(() => showToast('No se pudo cargar el resumen del dashboard', 'danger'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p>Cargando...</p>
  if (!resumen) return <p>No hay datos disponibles</p>

  const trendIngresos = trendPct(tendencia, 'ingresos')
  const trendAsistencia = trendPct(tendencia, 'asistencias')
  const gananciaPositiva = resumen.gananciaMensual >= 0

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 26, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Panel ejecutivo</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: 0 }}>
            Bienvenido de nuevo, {user?.nombre ?? 'Administrador'}. Esto es lo que sucede hoy en{' '}
            <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>GymOne</span>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" onClick={() => navigate('/pagos')}>
            Registrar pago
          </Button>
          <Button onClick={() => navigate('/asistencia')}>Registrar asistencia</Button>
        </div>
      </div>

      <motion.div
        variants={gridContainer}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}
      >
        <StatCard
          icon={IconDinero}
          iconBg="rgba(56,189,248,0.14)"
          iconColor="#38bdf8"
          label="Ingresos hoy"
          value={resumen.ingresosHoy}
          format={money}
          sub={<TrendBadge pct={trendIngresos} />}
        />
        <StatCard
          icon={IconDinero}
          iconBg="rgba(245,158,11,0.14)"
          iconColor="#f59e0b"
          label="Ingresos del mes"
          value={resumen.ingresosMes}
          format={money}
          sub={<span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Total acumulado</span>}
        />
        <StatCard
          icon={IconTrend}
          iconBg={gananciaPositiva ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.14)'}
          iconColor={gananciaPositiva ? '#22c55e' : '#ef4444'}
          label="Ganancia mensual"
          value={resumen.gananciaMensual}
          format={money}
          sub={<span style={{ color: gananciaPositiva ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>{gananciaPositiva ? 'Balance positivo' : 'Balance negativo'}</span>}
        />
        <StatCard
          icon={IconUsers}
          iconBg="rgba(99,102,241,0.14)"
          iconColor="#6366f1"
          label="Clientes activos"
          value={resumen.clientesActivos}
          format={(v) => Math.round(v)}
          sub={<span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{resumen.clientesVencidos} vencidos</span>}
        />
      </motion.div>

      <motion.div
        variants={gridContainer}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}
      >
        <Chip label="Clientes vencidos" value={resumen.clientesVencidos} color="var(--color-danger)" />
        <Chip label="Nuevos clientes hoy" value={resumen.nuevosClientes} />
        <Chip label="Renovaciones hoy" value={resumen.renovaciones} />
        <Chip label="Asistencia hoy" value={resumen.asistenciaHoy} />
        <Chip label="Productos vendidos hoy" value={resumen.productosVendidos} />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
        <Card title="Ingresos — últimos 7 días">
          <AreaChart data={tendencia.map((d) => ({ label: diaCorto(d.fecha), value: Number(d.ingresos) }))} formatValue={moneyCompact} color="var(--color-primary-strong)" />
        </Card>

        <Card title="Clientes: activos vs. vencidos">
          <DonutChart
            data={[
              { label: 'Activos', value: resumen.clientesActivos, color: 'var(--color-primary-strong)' },
              { label: 'Vencidos', value: resumen.clientesVencidos, color: 'var(--color-border-input)' },
            ]}
          />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
        <Card title="Asistencia — últimos 7 días">
          <BarChart
            data={tendencia.map((d) => ({
              label: diaCorto(d.fecha),
              value: Number(d.asistencias),
              gradientFrom: '#5ec8fa',
              gradientTo: 'var(--color-primary-strong)',
              glow: 'rgba(56,189,248,0.3)',
            }))}
            height={150}
            formatValue={(v) => Math.round(v)}
          />
          <div style={{ marginTop: 8 }}>
            <TrendBadge pct={trendAsistencia} />
          </div>
        </Card>

        <Card title="Caja del día" style={{ display: 'flex', flexDirection: 'column' }}>
          <Badge variant={resumen.cajaAbierta ? 'success' : 'neutral'}>{resumen.cajaAbierta ? 'Abierta' : 'Sin abrir'}</Badge>
          {resumen.cajaAbierta && (
            <p style={{ fontSize: 28, fontWeight: 800, margin: 'auto 0 0', fontFamily: 'var(--font-display)' }}>
              <AnimatedNumber value={resumen.cajaSaldoActual} format={money} />
            </p>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 'var(--spacing-3)' }}>
        <Card title="Membresías por vencer" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 4px' }}>
            <span />
            {porVencer.length > 0 && <Badge variant="danger">ALTA PRIORIDAD</Badge>}
          </div>
          <Table
            columns={[
              { key: 'clienteNombre', header: 'Miembro' },
              { key: 'planNombre', header: 'Plan' },
              {
                key: 'fechaFin',
                header: 'Vence',
                render: (row) => {
                  const dias = diasRestantes(row.fechaFin)
                  return <Badge variant="warning">{dias <= 0 ? 'Hoy' : `En ${dias}d`}</Badge>
                },
              },
              {
                key: 'acciones',
                header: '',
                render: (row) => (
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate(`/clientes/${row.clienteId}`)}>
                    Ver
                  </span>
                ),
              },
            ]}
            data={porVencer}
            emptyMessage="Sin membresías por vencer"
          />
        </Card>

        <Card title="Actividad reciente">
          <Table
            columns={[
              { key: 'clienteNombre', header: 'Cliente' },
              { key: 'tipo', header: 'Tipo' },
              { key: 'monto', header: 'Monto', render: (row) => money(row.monto) },
            ]}
            data={actividad}
            emptyMessage="Sin actividad reciente"
          />
        </Card>
      </div>
    </div>
  )
}

function Chip({ label, value, color }) {
  return (
    <motion.div variants={cardVariants}>
      <Card style={{ padding: '16px 18px' }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {label}
        </p>
        <p style={{ fontSize: 21, fontWeight: 800, margin: '8px 0 0', color: color ?? 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
          <AnimatedNumber value={value} />
        </p>
      </Card>
    </motion.div>
  )
}
