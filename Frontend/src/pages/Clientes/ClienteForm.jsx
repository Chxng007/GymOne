import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Tabs } from '../../components/ui/Tabs'
import { useToast } from '../../context/ToastContext'
import { actualizarCliente, crearCliente, obtenerCliente } from '../../services/clientesService'
import { ClienteAsistencia } from './ClienteAsistencia'
import { ClienteMembresias } from './ClienteMembresias'
import { ClientePagos } from './ClientePagos'
import { ClienteRutinas } from './ClienteRutinas'

const ESTADO_OPTIONS = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'VENCIDO', label: 'Vencido' },
]

const EMPTY_FORM = {
  fotoUrl: '',
  primerNombre: '',
  segundoNombre: '',
  documento: '',
  fechaNacimiento: '',
  telefono: '',
  correo: '',
  direccion: '',
  contactoEmergenciaNombre: '',
  contactoEmergenciaTelefono: '',
  eps: '',
  observaciones: '',
  pesoKg: '',
  alturaCm: '',
  objetivo: '',
  estado: 'ACTIVO',
}

export function ClienteForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    obtenerCliente(id)
      .then((data) => {
        const normalized = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, value ?? '']),
        )
        setForm({ ...EMPTY_FORM, ...normalized })
      })
      .catch(() => setError('No se pudo cargar el cliente'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      ...form,
      pesoKg: form.pesoKg === '' ? null : Number(form.pesoKg),
      alturaCm: form.alturaCm === '' ? null : Number(form.alturaCm),
    }

    try {
      if (isEdit) {
        await actualizarCliente(id, payload)
        showToast('Cliente actualizado', 'success')
      } else {
        await crearCliente(payload)
        showToast('Cliente creado', 'success')
      }
      navigate('/clientes')
    } catch (err) {
      const responseData = err.response?.data
      const message = responseData?.error ?? Object.values(responseData ?? {}).join(', ')
      setError(message || 'No se pudo guardar el cliente')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando...</p>

  const infoForm = (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <Card title="Información personal">
          <div style={fieldGrid}>
            <Input label="Primer nombre" required value={form.primerNombre} onChange={(e) => handleChange('primerNombre', e.target.value)} />
            <Input label="Segundo nombre" value={form.segundoNombre} onChange={(e) => handleChange('segundoNombre', e.target.value)} />
            <Input label="Documento" required value={form.documento} onChange={(e) => handleChange('documento', e.target.value)} />
            <Input label="Fecha de nacimiento" type="date" required value={form.fechaNacimiento} onChange={(e) => handleChange('fechaNacimiento', e.target.value)} />
            <Input label="Teléfono" required value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} />
            <Input label="Correo" type="email" value={form.correo} onChange={(e) => handleChange('correo', e.target.value)} />
            <Input label="Dirección" value={form.direccion} onChange={(e) => handleChange('direccion', e.target.value)} />
            <Select label="Estado" options={ESTADO_OPTIONS} value={form.estado} onChange={(e) => handleChange('estado', e.target.value)} />
          </div>
        </Card>

        <Card title="Contacto de emergencia">
          <div style={fieldGrid}>
            <Input label="Nombre" value={form.contactoEmergenciaNombre} onChange={(e) => handleChange('contactoEmergenciaNombre', e.target.value)} />
            <Input label="Teléfono" value={form.contactoEmergenciaTelefono} onChange={(e) => handleChange('contactoEmergenciaTelefono', e.target.value)} />
            <Input label="EPS" value={form.eps} onChange={(e) => handleChange('eps', e.target.value)} />
          </div>
        </Card>

        <Card title="Datos físicos y objetivo">
          <div style={fieldGrid}>
            <Input label="Peso (kg)" type="number" step="0.1" value={form.pesoKg} onChange={(e) => handleChange('pesoKg', e.target.value)} />
            <Input label="Altura (cm)" type="number" step="0.1" value={form.alturaCm} onChange={(e) => handleChange('alturaCm', e.target.value)} />
            <Input label="Objetivo" value={form.objetivo} onChange={(e) => handleChange('objetivo', e.target.value)} />
          </div>
          <div style={{ marginTop: 'var(--spacing-3)' }}>
            <Input label="Observaciones" value={form.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} />
          </div>
        </Card>

        {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/clientes')}>
            Cancelar
          </Button>
        </div>
      </form>
  )

  return (
    <div>
      <h1>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h1>

      {isEdit ? (
        <Tabs
          items={[
            { key: 'info', label: 'Info', content: infoForm },
            { key: 'membresia', label: 'Membresía', content: <ClienteMembresias clienteId={id} /> },
            { key: 'pagos', label: 'Pagos', content: <ClientePagos clienteId={id} /> },
            { key: 'asistencia', label: 'Asistencia', content: <ClienteAsistencia clienteId={id} /> },
            { key: 'rutinas', label: 'Rutinas', content: <ClienteRutinas clienteId={id} /> },
          ]}
        />
      ) : (
        infoForm
      )}
    </div>
  )
}

const fieldGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 'var(--spacing-3)',
}
