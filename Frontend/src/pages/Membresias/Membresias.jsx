import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { crearPlan, eliminarPlan, listarPlanes, actualizarPlan } from '../../services/planesService'
import { listarTodasSuscripciones } from '../../services/suscripcionesService'

const EMPTY_FORM = { nombre: '', duracionDias: '', precio: '', beneficios: '' }

const ESTADO_SUS_VARIANT = { ACTIVA: 'success', CONGELADA: 'warning', VENCIDA: 'danger', CANCELADA: 'neutral' }

const ICON_PLAN = 'M3 6h18v12H3z M3 10h18 M7 15h4'

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-strong)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M5 12l4 4L19 6" />
    </svg>
  )
}

export function Membresias() {
  const { showToast } = useToast()
  const [planes, setPlanes] = useState([])
  const [suscripciones, setSuscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      const [planesData, susData] = await Promise.all([listarPlanes(), listarTodasSuscripciones()])
      setPlanes(planesData)
      setSuscripciones(susData.filter((s) => s.estado === 'ACTIVA'))
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Membresías y planes</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: 0 }}>Administra las configuraciones de nivel y monitorea ciclos activos.</p>
        </div>
        <Button onClick={abrirNuevo}>Nuevo plan</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18, marginBottom: 30 }}>
            {planes.map((plan) => (
              <Card key={plan.id} style={{ padding: '26px 24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--color-text)' }}>{plan.nombre}</div>
                    <div style={{ marginTop: 4 }}>
                      <Badge variant={plan.activo ? 'success' : 'neutral'}>{plan.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8">
                      <path d={ICON_PLAN} />
                    </svg>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--color-text)' }}>
                    ${Number(plan.precio).toLocaleString('es-CO')}
                  </span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12.5, fontWeight: 600, marginBottom: 18 }}>{plan.duracionDias} días</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
                  {plan.beneficios.map((b) => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <CheckIcon />
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 13.5 }}>{b}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="secondary" onClick={() => abrirEditar(plan)} style={{ flex: 1, justifyContent: 'center' }}>
                    Editar
                  </Button>
                  <Button variant="secondary" onClick={() => handleEliminar(plan.id)} style={{ flex: 1, justifyContent: 'center' }}>
                    Desactivar
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card title="Suscripciones activas" style={{ padding: 0, overflow: 'hidden' }}>
            <Table
              columns={[
                { key: 'clienteNombre', header: 'Cliente' },
                { key: 'planNombre', header: 'Plan actual' },
                { key: 'fechaInicio', header: 'Inicio' },
                { key: 'fechaFin', header: 'Vence' },
                { key: 'estado', header: 'Estado', render: (r) => <Badge variant={ESTADO_SUS_VARIANT[r.estado]}>{r.estado}</Badge> },
              ]}
              data={suscripciones}
              emptyMessage="No hay suscripciones activas"
            />
          </Card>
        </>
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
