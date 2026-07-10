import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import {
  actualizarEntrenador,
  crearEntrenador,
  eliminarEntrenador,
  listarEntrenadores,
} from '../../services/entrenadoresService'

const EMPTY_FORM = { nombre: '', telefono: '', especialidad: '', horario: '' }

export function Entrenadores() {
  const { showToast } = useToast()
  const [entrenadores, setEntrenadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      setEntrenadores(await listarEntrenadores())
    } catch {
      showToast('No se pudieron cargar los entrenadores', 'danger')
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

  function abrirEditar(entrenador) {
    setEditingId(entrenador.id)
    setForm({
      nombre: entrenador.nombre,
      telefono: entrenador.telefono,
      especialidad: entrenador.especialidad,
      horario: entrenador.horario ?? '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await actualizarEntrenador(editingId, form)
        showToast('Entrenador actualizado', 'success')
      } else {
        await crearEntrenador(form)
        showToast('Entrenador creado', 'success')
      }
      setModalOpen(false)
      cargar()
    } catch {
      showToast('No se pudo guardar el entrenador', 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este entrenador?')) return
    try {
      await eliminarEntrenador(id)
      showToast('Entrenador eliminado', 'success')
      cargar()
    } catch {
      showToast('No se pudo eliminar el entrenador', 'danger')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Entrenadores</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: 0 }}>Administra el personal profesional del gimnasio y sus horarios.</p>
        </div>
        <Button onClick={abrirNuevo}>Nuevo entrenador</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : entrenadores.length === 0 ? (
        <Card style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>No hay entrenadores registrados todavía.</div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={[
              { key: 'nombre', header: 'Nombre' },
              { key: 'telefono', header: 'Teléfono' },
              { key: 'especialidad', header: 'Especialidad' },
              { key: 'horario', header: 'Horario' },
              {
                key: 'acciones',
                header: '',
                render: (row) => (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" onClick={() => abrirEditar(row)}>
                      Editar
                    </Button>
                    <Button variant="secondary" onClick={() => handleEliminar(row.id)}>
                      Eliminar
                    </Button>
                  </div>
                ),
              },
            ]}
            data={entrenadores}
            emptyMessage="No hay entrenadores registrados"
          />
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar entrenador' : 'Nuevo entrenador'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', width: 320 }}>
          <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input label="Teléfono" required value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Input label="Especialidad" required value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} />
          <Input label="Horario" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
