import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { BarChart } from '../../components/ui/Charts'
import { useToast } from '../../context/ToastContext'
import { obtenerResumenDashboard } from '../../services/dashboardService'

function money(value) {
  return `$${Number(value ?? 0).toLocaleString('es-CO')}`
}

function Kpi({ label, value, color }) {
  return (
    <Card>
      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 13 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, margin: 0, color: color ?? 'var(--color-text)' }}>{value}</p>
    </Card>
  )
}

export function Dashboard() {
  const { showToast } = useToast()
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerResumenDashboard()
      .then(setResumen)
      .catch(() => showToast('No se pudo cargar el resumen del dashboard', 'danger'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p>Cargando...</p>
  if (!resumen) return <p>No hay datos disponibles</p>

  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--spacing-3)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        <Kpi label="Clientes activos" value={resumen.clientesActivos} color="var(--color-success)" />
        <Kpi label="Clientes vencidos" value={resumen.clientesVencidos} color="var(--color-danger)" />
        <Kpi label="Nuevos clientes hoy" value={resumen.nuevosClientes} />
        <Kpi label="Renovaciones hoy" value={resumen.renovaciones} />
        <Kpi label="Asistencia hoy" value={resumen.asistenciaHoy} />
        <Kpi label="Productos vendidos hoy" value={resumen.productosVendidos} />
        <Kpi label="Ingresos hoy" value={money(resumen.ingresosHoy)} color="var(--color-success)" />
        <Kpi label="Ingresos del mes" value={money(resumen.ingresosMes)} color="var(--color-success)" />
        <Kpi
          label="Ganancia mensual"
          value={money(resumen.gananciaMensual)}
          color={resumen.gananciaMensual >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-3)' }}>
        <Card title="Ingresos: hoy vs. mes">
          <BarChart
            data={[
              { label: 'Hoy', value: Number(resumen.ingresosHoy) },
              { label: 'Mes', value: Number(resumen.ingresosMes) },
            ]}
          />
        </Card>

        <Card title="Clientes: activos vs. vencidos">
          <BarChart
            data={[
              { label: 'Activos', value: resumen.clientesActivos },
              { label: 'Vencidos', value: resumen.clientesVencidos },
            ]}
            color="var(--color-success)"
          />
        </Card>

        <Card title="Caja del día">
          <Badge variant={resumen.cajaAbierta ? 'success' : 'neutral'}>
            {resumen.cajaAbierta ? 'Abierta' : 'Sin abrir'}
          </Badge>
          {resumen.cajaAbierta && (
            <p style={{ fontSize: 22, fontWeight: 700, marginTop: 'var(--spacing-2)' }}>
              {money(resumen.cajaSaldoActual)}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
