import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useToast } from '../../context/ToastContext'
import { listarClientes } from '../../services/clientesService'
import { crearPago } from '../../services/pagosService'

const TIPO_OPTIONS = [
  { value: 'PAGO', label: 'Pago' },
  { value: 'ABONO', label: 'Abono' },
  { value: 'DESCUENTO', label: 'Descuento' },
  { value: 'PROMOCION', label: 'Promoción' },
]

const METODO_OPTIONS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'DAVIPLATA', label: 'Daviplata' },
]

export function PagoForm({ clienteId, onSaved }) {
  const { showToast } = useToast()
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({
    clienteId: clienteId ?? '',
    tipo: 'PAGO',
    metodo: 'EFECTIVO',
    monto: '',
    nota: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (clienteId) return
    listarClientes().then(setClientes)
  }, [clienteId])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await crearPago({
        clienteId: Number(clienteId ?? form.clienteId),
        tipo: form.tipo,
        metodo: form.metodo,
        monto: Number(form.monto),
        nota: form.nota || null,
      })
      showToast('Pago registrado', 'success')
      setForm((current) => ({ ...current, monto: '', nota: '' }))
      onSaved?.()
    } catch {
      showToast('No se pudo registrar el pago', 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)', alignItems: 'flex-end' }}>
      {!clienteId && (
        <Select
          label="Cliente"
          required
          value={form.clienteId}
          onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
          options={clientes.map((c) => ({ value: c.id, label: `${c.primerNombre} ${c.segundoNombre ?? ''}`.trim() }))}
        />
      )}
      <Select label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} options={TIPO_OPTIONS} />
      <Select label="Método" value={form.metodo} onChange={(e) => setForm({ ...form, metodo: e.target.value })} options={METODO_OPTIONS} />
      <Input
        label="Monto"
        type="number"
        required
        value={form.monto}
        onChange={(e) => setForm({ ...form, monto: e.target.value })}
      />
      <Input label="Nota" value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} />
      <Button type="submit" disabled={saving}>
        {saving ? 'Registrando...' : 'Registrar pago'}
      </Button>
    </form>
  )
}
