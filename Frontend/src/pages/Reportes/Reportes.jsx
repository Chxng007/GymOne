import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Table } from '../../components/ui/Table'
import { Tabs } from '../../components/ui/Tabs'
import { useToast } from '../../context/ToastContext'
import { listarAsistenciaHoy } from '../../services/asistenciaService'
import { historialCaja } from '../../services/cajaService'
import { listarClientes } from '../../services/clientesService'
import { listarEntrenadores } from '../../services/entrenadoresService'
import { listarGastos } from '../../services/gastosService'
import { listarPagos } from '../../services/pagosService'
import { listarProductos } from '../../services/productosService'
import { listarTodasSuscripciones } from '../../services/suscripcionesService'
import { listarVentas } from '../../services/ventasService'

function money(value) {
  return `$${Number(value ?? 0).toLocaleString('es-CO')}`
}

const ESTADO_CLIENTE_VARIANT = { ACTIVO: 'success', SUSPENDIDO: 'warning', VENCIDO: 'danger' }
const ESTADO_SUS_VARIANT = { ACTIVA: 'success', CONGELADA: 'warning', VENCIDA: 'danger', CANCELADA: 'neutral' }

function ReporteClientes({ clientes }) {
  const activos = clientes.filter((c) => c.estado === 'ACTIVO').length
  const suspendidos = clientes.filter((c) => c.estado === 'SUSPENDIDO').length
  const vencidos = clientes.filter((c) => c.estado === 'VENCIDO').length

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
        <Card><p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Activos</p><p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{activos}</p></Card>
        <Card><p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Suspendidos</p><p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{suspendidos}</p></Card>
        <Card><p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Vencidos</p><p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{vencidos}</p></Card>
      </div>
      <Table
        columns={[
          { key: 'nombre', header: 'Nombre', render: (r) => `${r.primerNombre} ${r.segundoNombre ?? ''}`.trim() },
          { key: 'documento', header: 'Documento' },
          { key: 'estado', header: 'Estado', render: (r) => <Badge variant={ESTADO_CLIENTE_VARIANT[r.estado]}>{r.estado}</Badge> },
        ]}
        data={clientes}
        emptyMessage="No hay clientes"
      />
    </div>
  )
}

function ReporteIngresos({ pagos }) {
  const total = pagos.reduce((acc, p) => acc + Number(p.monto), 0)
  const porMetodo = pagos.reduce((acc, p) => {
    acc[p.metodo] = (acc[p.metodo] ?? 0) + Number(p.monto)
    return acc
  }, {})

  return (
    <div>
      <p style={{ fontSize: 18, marginBottom: 'var(--spacing-3)' }}>
        Total histórico: <strong>{money(total)}</strong>
      </p>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)', flexWrap: 'wrap' }}>
        {Object.entries(porMetodo).map(([metodo, monto]) => (
          <Card key={metodo}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{metodo}</p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{money(monto)}</p>
          </Card>
        ))}
      </div>
      <Table
        columns={[
          { key: 'clienteNombre', header: 'Cliente' },
          { key: 'tipo', header: 'Tipo' },
          { key: 'metodo', header: 'Método' },
          { key: 'monto', header: 'Monto', render: (r) => money(r.monto) },
          { key: 'fecha', header: 'Fecha', render: (r) => new Date(r.fecha).toLocaleDateString('es-CO') },
        ]}
        data={pagos}
        emptyMessage="No hay pagos"
      />
    </div>
  )
}

function ReporteVentas({ ventas }) {
  const total = ventas.reduce((acc, v) => acc + Number(v.total), 0)
  return (
    <div>
      <p style={{ fontSize: 18, marginBottom: 'var(--spacing-3)' }}>
        Total histórico: <strong>{money(total)}</strong>
      </p>
      <Table
        columns={[
          { key: 'fecha', header: 'Fecha', render: (r) => new Date(r.fecha).toLocaleDateString('es-CO') },
          { key: 'items', header: 'Productos', render: (r) => r.items.map((i) => `${i.productoNombre} x${i.cantidad}`).join(', ') },
          { key: 'total', header: 'Total', render: (r) => money(r.total) },
          { key: 'metodoPago', header: 'Método' },
        ]}
        data={ventas}
        emptyMessage="No hay ventas"
      />
    </div>
  )
}

function ReporteInventario({ productos }) {
  const bajoStock = productos.filter((p) => p.stock <= 3)
  return (
    <div>
      {bajoStock.length > 0 && (
        <p style={{ color: 'var(--color-warning)', marginBottom: 'var(--spacing-3)' }}>
          {bajoStock.length} producto(s) con stock bajo (≤ 3 unidades)
        </p>
      )}
      <Table
        columns={[
          { key: 'nombre', header: 'Producto' },
          { key: 'categoria', header: 'Categoría' },
          { key: 'stock', header: 'Stock', render: (r) => <Badge variant={r.stock <= 3 ? 'danger' : 'success'}>{r.stock}</Badge> },
          { key: 'precio', header: 'Precio', render: (r) => money(r.precio) },
        ]}
        data={productos}
        emptyMessage="No hay productos"
      />
    </div>
  )
}

function ReporteCaja({ sesiones }) {
  return (
    <Table
      columns={[
        { key: 'fecha', header: 'Fecha' },
        { key: 'saldoInicial', header: 'Saldo inicial', render: (r) => money(r.saldoInicial) },
        { key: 'totalIngresos', header: 'Ingresos', render: (r) => money(r.totalIngresos) },
        { key: 'totalEgresos', header: 'Egresos', render: (r) => money(r.totalEgresos) },
        { key: 'saldoFinal', header: 'Saldo final', render: (r) => (r.saldoFinal != null ? money(r.saldoFinal) : '—') },
        { key: 'responsableNombre', header: 'Responsable' },
        { key: 'estado', header: 'Estado', render: (r) => <Badge variant={r.estado === 'ABIERTA' ? 'success' : 'neutral'}>{r.estado}</Badge> },
      ]}
      data={sesiones}
      emptyMessage="No hay sesiones de caja"
    />
  )
}

function ReporteRenovaciones({ suscripciones }) {
  return (
    <Table
      columns={[
        { key: 'clienteNombre', header: 'Cliente' },
        { key: 'planNombre', header: 'Plan' },
        { key: 'fechaInicio', header: 'Inicio' },
        { key: 'fechaFin', header: 'Vence' },
        { key: 'estado', header: 'Estado', render: (r) => <Badge variant={ESTADO_SUS_VARIANT[r.estado]}>{r.estado}</Badge> },
      ]}
      data={suscripciones}
      emptyMessage="No hay suscripciones"
    />
  )
}

function ReporteEntrenadores({ entrenadores }) {
  return (
    <Table
      columns={[
        { key: 'nombre', header: 'Nombre' },
        { key: 'especialidad', header: 'Especialidad' },
        { key: 'telefono', header: 'Teléfono' },
        { key: 'horario', header: 'Horario' },
      ]}
      data={entrenadores}
      emptyMessage="No hay entrenadores"
    />
  )
}

function ReporteAsistencia({ asistencias }) {
  return (
    <Table
      columns={[
        { key: 'clienteNombre', header: 'Cliente' },
        { key: 'horaEntrada', header: 'Entrada', render: (r) => new Date(r.horaEntrada).toLocaleTimeString('es-CO') },
        { key: 'horaSalida', header: 'Salida', render: (r) => (r.horaSalida ? new Date(r.horaSalida).toLocaleTimeString('es-CO') : '—') },
      ]}
      data={asistencias}
      emptyMessage="Sin asistencia hoy"
    />
  )
}

export function Reportes() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    Promise.all([
      listarClientes(),
      listarPagos(),
      listarVentas(),
      listarProductos(),
      historialCaja(),
      listarTodasSuscripciones(),
      listarEntrenadores(),
      listarAsistenciaHoy(),
      listarGastos(),
    ])
      .then(([clientes, pagos, ventas, productos, caja, suscripciones, entrenadores, asistencias, gastos]) =>
        setDatos({ clientes, pagos, ventas, productos, caja, suscripciones, entrenadores, asistencias, gastos }),
      )
      .catch(() => showToast('No se pudieron cargar los reportes', 'danger'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p>Cargando...</p>
  if (!datos) return <p>No hay datos disponibles</p>

  return (
    <div>
      <h1>Reportes</h1>
      <Tabs
        items={[
          { key: 'clientes', label: 'Clientes', content: <ReporteClientes clientes={datos.clientes} /> },
          { key: 'ingresos', label: 'Ingresos', content: <ReporteIngresos pagos={datos.pagos} /> },
          { key: 'ventas', label: 'Ventas', content: <ReporteVentas ventas={datos.ventas} /> },
          { key: 'inventario', label: 'Inventario', content: <ReporteInventario productos={datos.productos} /> },
          { key: 'caja', label: 'Caja', content: <ReporteCaja sesiones={datos.caja} /> },
          { key: 'renovaciones', label: 'Membresías', content: <ReporteRenovaciones suscripciones={datos.suscripciones} /> },
          { key: 'entrenadores', label: 'Entrenadores', content: <ReporteEntrenadores entrenadores={datos.entrenadores} /> },
          { key: 'asistencia', label: 'Asistencia hoy', content: <ReporteAsistencia asistencias={datos.asistencias} /> },
        ]}
      />
    </div>
  )
}
