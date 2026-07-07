import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useToast } from '../../context/ToastContext'
import { actualizarConfiguracion, obtenerConfiguracion } from '../../services/configuracionService'

const EMPTY_FORM = {
  nombre: '',
  logoUrl: '',
  direccion: '',
  telefono: '',
  moneda: 'COP',
  impuestoPorcentaje: '0',
  horarioApertura: '',
  horarioCierre: '',
}

export function Configuracion() {
  const { showToast } = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    obtenerConfiguracion()
      .then((data) => {
        const normalized = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? '']))
        setForm({ ...EMPTY_FORM, ...normalized })
      })
      .catch(() => showToast('No se pudo cargar la configuración', 'danger'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await actualizarConfiguracion({
        ...form,
        impuestoPorcentaje: Number(form.impuestoPorcentaje || 0),
        logoUrl: form.logoUrl || null,
        direccion: form.direccion || null,
        telefono: form.telefono || null,
        horarioApertura: form.horarioApertura || null,
        horarioCierre: form.horarioCierre || null,
      })
      showToast('Configuración guardada', 'success')
    } catch {
      showToast('No se pudo guardar la configuración', 'danger')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      <h1>Configuración</h1>

      <Card title="Datos del gimnasio" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input label="Logo (URL)" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Input label="Moneda" required value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })} />
          <Input
            label="Impuesto (%)"
            type="number"
            value={form.impuestoPorcentaje}
            onChange={(e) => setForm({ ...form, impuestoPorcentaje: e.target.value })}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Input label="Apertura" type="time" value={form.horarioApertura} onChange={(e) => setForm({ ...form, horarioApertura: e.target.value })} />
            <Input label="Cierre" type="time" value={form.horarioCierre} onChange={(e) => setForm({ ...form, horarioCierre: e.target.value })} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
