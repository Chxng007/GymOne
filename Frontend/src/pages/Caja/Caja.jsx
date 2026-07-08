import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import {
  abrirCaja,
  cerrarCaja,
  obtenerCajaActual,
  registrarMovimiento,
} from '../../services/cajaService'

const TIPO_OPTIONS = [
  { value: 'INGRESO', label: 'Ingreso' },
  { value: 'EGRESO', label: 'Egreso' },
]

export function Caja() {
  const { showToast } = useToast()
  const [sesion, setSesion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saldoInicial, setSaldoInicial] = useState('')
  const [movForm, setMovForm] = useState({ tipo: 'INGRESO', concepto: '', monto: '' })
  const [saving, setSaving] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      setSesion(await obtenerCajaActual())
    } catch (err) {
      if (err.response?.status === 404) {
        setSesion(null)
      } else {
        showToast('No se pudo cargar la caja', 'danger')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function handleAbrir(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await abrirCaja(Number(saldoInicial))
      showToast('Caja abierta', 'success')
      cargar()
    } catch (err) {
      showToast(err.response?.data?.error ?? 'No se pudo abrir la caja', 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleMovimiento(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await registrarMovimiento(sesion.id, {
        tipo: movForm.tipo,
        concepto: movForm.concepto,
        monto: Number(movForm.monto),
      })
      showToast('Movimiento registrado', 'success')
      setMovForm({ tipo: 'INGRESO', concepto: '', monto: '' })
      cargar()
    } catch {
      showToast('No se pudo registrar el movimiento', 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleCerrar() {
    if (!confirm('¿Cerrar la caja del día?')) return
    try {
      await cerrarCaja(sesion.id)
      showToast('Caja cerrada', 'success')
      cargar()
    } catch {
      showToast('No se pudo cerrar la caja', 'danger')
    }
  }

  if (loading) return <p>Cargando...</p>

  const abierta = sesion?.estado === 'ABIERTA'

  if (!sesion || !abierta) {
    return (
      <div>
        <h1>Caja</h1>

        {sesion && (
          <Card title="Última sesión (cerrada)" style={{ maxWidth: 320, marginBottom: 'var(--spacing-4)' }}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Saldo final</p>
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>${Number(sesion.saldoFinal ?? sesion.saldoActual).toLocaleString('es-CO')}</p>
          </Card>
        )}

        <Card title="Abrir caja del día" style={{ maxWidth: 320 }}>
          <form onSubmit={handleAbrir} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <Input
              label="Saldo inicial"
              type="number"
              required
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
            />
            <Button type="submit" disabled={saving}>
              {saving ? 'Abriendo...' : 'Abrir caja'}
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h1 style={{ margin: 0 }}>Caja</h1>
        <Badge variant={abierta ? 'success' : 'neutral'}>{sesion.estado}</Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
        <Card>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Saldo inicial</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>${Number(sesion.saldoInicial).toLocaleString('es-CO')}</p>
        </Card>
        <Card>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Ingresos</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--color-success)' }}>
            ${Number(sesion.totalIngresos).toLocaleString('es-CO')}
          </p>
        </Card>
        <Card>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Egresos</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--color-danger)' }}>
            ${Number(sesion.totalEgresos).toLocaleString('es-CO')}
          </p>
        </Card>
        <Card>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Saldo actual</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>${Number(sesion.saldoActual).toLocaleString('es-CO')}</p>
        </Card>
      </div>

      {abierta && (
        <Card title="Registrar movimiento" style={{ marginBottom: 'var(--spacing-4)' }}>
          <form onSubmit={handleMovimiento} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)', alignItems: 'flex-end' }}>
            <Select label="Tipo" value={movForm.tipo} onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value })} options={TIPO_OPTIONS} />
            <Input label="Concepto" required value={movForm.concepto} onChange={(e) => setMovForm({ ...movForm, concepto: e.target.value })} />
            <Input label="Monto" type="number" required value={movForm.monto} onChange={(e) => setMovForm({ ...movForm, monto: e.target.value })} />
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Registrar'}
            </Button>
          </form>
        </Card>
      )}

      <Table
        columns={[
          { key: 'tipo', header: 'Tipo' },
          { key: 'concepto', header: 'Concepto' },
          { key: 'monto', header: 'Monto', render: (row) => `$${Number(row.monto).toLocaleString('es-CO')}` },
          { key: 'fecha', header: 'Fecha', render: (row) => new Date(row.fecha).toLocaleTimeString('es-CO') },
        ]}
        data={sesion.movimientos}
        emptyMessage="Sin movimientos registrados"
      />

      {abierta && (
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <Button variant="secondary" onClick={handleCerrar}>
            Cerrar caja
          </Button>
        </div>
      )}
    </div>
  )
}
