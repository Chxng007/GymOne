import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { AreaChart, BarChart, DonutChart, Sparkline } from '../../components/ui/Charts'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { obtenerResumenDashboard, obtenerTendenciaDashboard } from '../../services/dashboardService'
import { listarPagos } from '../../services/pagosService'

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

function trendPct(dias, key) {
  if (!dias || dias.length < 2) return null
  const hoy = Number(dias[dias.length - 1][key])
  const ayer = Number(dias[dias.length - 2][key])
  if (ayer === 0) return hoy > 0 ? 100 : 0
  return Math.round(((hoy - ayer) / ayer) * 100)
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

function TrendBadge({ pct }) {
  if (pct === null) return null
  const up = pct >= 0
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 11.5,
        fontWeight: 700,
        color: up ? 'var(--color-primary)' : 'var(--color-danger)',
      }}
    >
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  )
}

function HeroStat({ icon, label, value, format, sparklineData, trend, accent }) {
  return (
    <motion.div variants={cardVariants}>
      <Card style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent ?? 'var(--color-primary)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}>{icon}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <AnimatedNumber value={value} format={format} />
              <TrendBadge pct={trend} />
            </div>
          </div>
          {sparklineData && <Sparkline data={sparklineData} color={accent ?? 'var(--color-primary)'} />}
        </div>
      </Card>
    </motion.div>
  )
}

function Chip({ label, value, color }) {
  return (
    <motion.div variants={cardVariants}>
      <Card style={{ padding: '16px 18px' }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 12.5, fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 21, fontWeight: 800, margin: '6px 0 0', color: color ?? 'var(--color-text)' }}>
          <AnimatedNumber value={value} />
        </p>
      </Card>
    </motion.div>
  )
}

const IconDinero = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7v10M9.5 9.5c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2c0 2.5-5 1.5-5 4 0 1.1 1.1 2 2.5 2s2.5-.9 2.5-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="17" cy="8.5" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M15.5 14.2c2.6.5 4.5 2.6 4.5 5.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export function Dashboard() {
  const { showToast } = useToast()
  const [resumen, setResumen] = useState(null)
  const [tendencia, setTendencia] = useState([])
  const [actividad, setActividad] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([obtenerResumenDashboard(), obtenerTendenciaDashboard(), listarPagos()])
      .then(([r, t, pagos]) => {
        setResumen(r)
        setTendencia(t)
        setActividad(pagos.slice(0, 5))
      })
      .catch(() => showToast('No se pudo cargar el resumen del dashboard', 'danger'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p>Cargando...</p>
  if (!resumen) return <p>No hay datos disponibles</p>

  const ingresosSparkline = tendencia.map((d) => Number(d.ingresos))
  const asistenciaSparkline = tendencia.map((d) => Number(d.asistencias))
  const trendIngresos = trendPct(tendencia, 'ingresos')
  const trendAsistencia = trendPct(tendencia, 'asistencias')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 13.5 }}>
            Resumen de hoy, {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(57,255,20,0.1)',
            border: '1px solid rgba(57,255,20,0.35)',
            color: 'var(--color-primary)',
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: 20,
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }}
          />
          En vivo
        </span>
      </div>

      <motion.div
        variants={gridContainer}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}
      >
        <HeroStat icon={<IconDinero />} label="Ingresos hoy" value={resumen.ingresosHoy} format={money} sparklineData={ingresosSparkline} trend={trendIngresos} />
        <HeroStat icon={<IconDinero />} label="Ingresos del mes" value={resumen.ingresosMes} format={money} accent="#5B9CFF" />
        <HeroStat
          icon={<IconDinero />}
          label="Ganancia mensual"
          value={resumen.gananciaMensual}
          format={money}
          accent={resumen.gananciaMensual >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'}
        />
        <HeroStat icon={<IconUsers />} label="Clientes activos" value={resumen.clientesActivos} format={(v) => Math.round(v)} accent="var(--color-primary)" />
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
          <AreaChart data={tendencia.map((d) => ({ label: diaCorto(d.fecha), value: Number(d.ingresos) }))} formatValue={moneyCompact} />
        </Card>

        <Card title="Clientes: activos vs. vencidos">
          <DonutChart
            data={[
              { label: 'Activos', value: resumen.clientesActivos, color: 'var(--color-primary)' },
              { label: 'Vencidos', value: resumen.clientesVencidos, color: 'var(--color-border-input)' },
            ]}
          />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 1.3fr', gap: 'var(--spacing-3)' }}>
        <Card title="Asistencia — últimos 7 días">
          <BarChart
            data={tendencia.map((d) => ({
              label: diaCorto(d.fecha),
              value: Number(d.asistencias),
              gradientFrom: '#7BFF4D',
              gradientTo: 'var(--color-primary)',
              glow: 'rgba(57,255,20,0.35)',
            }))}
            height={150}
          />
          <div style={{ marginTop: 8 }}>
            <TrendBadge pct={trendAsistencia} />
          </div>
        </Card>

        <Card title="Caja del día" style={{ display: 'flex', flexDirection: 'column' }}>
          <Badge variant={resumen.cajaAbierta ? 'success' : 'neutral'}>{resumen.cajaAbierta ? 'Abierta' : 'Sin abrir'}</Badge>
          {resumen.cajaAbierta && (
            <p style={{ fontSize: 28, fontWeight: 800, margin: 'auto 0 0' }}>
              <AnimatedNumber value={resumen.cajaSaldoActual} format={money} />
            </p>
          )}
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
