import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'
import { crearPlan, eliminarPlan, listarPlanes, actualizarPlan } from '../../services/planesService'

const EMPTY_FORM = { nombre: '', duracionDias: '', precio: '', beneficios: '' }

export function Membresias() {
  const { showToast } = useToast()
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      setPlanes(await listarPlanes())
    } catch {
      showToast('No se pudieron cargar los planes', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  function abrirNuevo() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function abrirEditar(plan) {
    setEditingId(plan.id)
    setForm({
      nombre: plan.nombre,
      duracionDias: plan.duracionDias,
      precio: plan.precio,
      beneficios: plan.beneficios.join(', '),
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      nombre: form.nombre,
      duracionDias: Number(form.duracionDias),
      precio: Number(form.precio),
      beneficios: form.beneficios
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean),
    }

    try {
      if (editingId) {
        await actualizarPlan(editingId, payload)
        showToast('Plan actualizado', 'success')
      } else {
        await crearPlan(payload)
        showToast('Plan creado', 'success')
      }
      setModalOpen(false)
      cargar()
    } catch {
      showToast('No se pudo guardar el plan', 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Desactivar este plan?')) return
    try {
      await eliminarPlan(id)
      showToast('Plan desactivado', 'success')
      cargar()
    } catch {
      showToast('No se pudo desactivar el plan', 'danger')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h1 style={{ margin: 0 }}>Membresías</h1>
        <Button onClick={abrirNuevo}>Nuevo plan</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-3)' }}>
          {planes.map((plan) => (
            <Card key={plan.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>{plan.nombre}</h3>
                <Badge variant={plan.activo ? 'success' : 'neutral'}>{plan.activo ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 'var(--spacing-2) 0' }}>
                ${Number(plan.precio).toLocaleString('es-CO')}
              </p>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{plan.duracionDias} días</p>
              <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 18 }}>
                {plan.beneficios.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 8, marginTop: 'var(--spacing-3)' }}>
                <Button variant="secondary" onClick={() => abrirEditar(plan)}>
                  Editar
                </Button>
                <Button variant="secondary" onClick={() => handleEliminar(plan.id)}>
                  Desactivar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar plan' : 'Nuevo plan'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', width: 320 }}>
          <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input
            label="Duración (días)"
            type="number"
            required
            value={form.duracionDias}
            onChange={(e) => setForm({ ...form, duracionDias: e.target.value })}
          />
          <Input
            label="Precio"
            type="number"
            required
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
          <Input
            label="Beneficios (separados por coma)"
            value={form.beneficios}
            onChange={(e) => setForm({ ...form, beneficios: e.target.value })}
          />
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
