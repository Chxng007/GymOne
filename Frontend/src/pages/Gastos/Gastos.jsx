import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { crearGasto, eliminarGasto, listarGastos } from '../../services/gastosService'

const CATEGORIA_OPTIONS = [
  { value: 'ARRIENDO', label: 'Arriendo' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'SALARIOS', label: 'Salarios' },
  { value: 'COMPRAS', label: 'Compras' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
]

export function Gastos() {
  const { showToast } = useToast()
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ categoria: 'ARRIENDO', descripcion: '', monto: '' })
  const [saving, setSaving] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      setGastos(await listarGastos())
    } catch {
      showToast('No se pudieron cargar los gastos', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await crearGasto({ ...form, monto: Number(form.monto) })
      showToast('Gasto registrado', 'success')
      setForm({ categoria: 'ARRIENDO', descripcion: '', monto: '' })
      cargar()
    } catch {
      showToast('No se pudo registrar el gasto', 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este gasto?')) return
    try {
      await eliminarGasto(id)
      showToast('Gasto eliminado', 'success')
      cargar()
    } catch {
      showToast('No se pudo eliminar el gasto', 'danger')
    }
  }

  const totalMes = gastos
    .filter((g) => new Date(g.fecha).getMonth() === new Date().getMonth())
    .reduce((acc, g) => acc + Number(g.monto), 0)

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Gastos operativos</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: '0 0 24px' }}>Resumen de mantenimiento y gastos generales.</p>

      <Card style={{ padding: '20px 22px', maxWidth: 260, marginBottom: 22 }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginBottom: 10 }}>
          Gasto del mes
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>${totalMes.toLocaleString('es-CO')}</div>
      </Card>

      <Card title="Registrar gasto" style={{ marginBottom: 'var(--spacing-4)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)', alignItems: 'flex-end' }}>
          <Select label="Categoría" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} options={CATEGORIA_OPTIONS} />
          <Input label="Descripción" required value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <Input label="Monto" type="number" required value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Registrar'}
          </Button>
        </form>
      </Card>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={[
              { key: 'fecha', header: 'Fecha' },
              { key: 'categoria', header: 'Categoría' },
              { key: 'descripcion', header: 'Descripción' },
              { key: 'monto', header: 'Monto', render: (row) => `$${Number(row.monto).toLocaleString('es-CO')}` },
              {
                key: 'acciones',
                header: '',
                render: (row) => (
                  <Button variant="secondary" onClick={() => handleEliminar(row.id)}>
                    Eliminar
                  </Button>
                ),
              },
            ]}
            data={gastos}
            emptyMessage="No hay gastos registrados"
          />
        </Card>
      )}
    </div>
  )
}
