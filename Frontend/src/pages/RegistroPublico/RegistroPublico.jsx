import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useToast } from '../../context/ToastContext'
import { registrarClientePublico } from '../../services/registroPublicoService'

const EMPTY_FORM = {
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
  pesoKg: '',
  alturaCm: '',
  objetivo: '',
}

export function RegistroPublico() {
  const { showToast } = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await registrarClientePublico({
        ...form,
        pesoKg: Number(form.pesoKg),
        alturaCm: Number(form.alturaCm),
      })
      setDone(true)
    } catch (err) {
      const responseData = err.response?.data
      const message = responseData?.error ?? Object.values(responseData ?? {}).join(', ')
      showToast(message || 'No se pudo completar el registro', 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: '40px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 28, justifyContent: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#00243a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6h6M6 6v6M18 18h-6M18 18v-6" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--color-text)' }}>GymOne</span>
        </div>

        {done ? (
          <Card style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.14)',
                border: '1px solid rgba(34,197,94,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 style={{ marginBottom: 10 }}>¡Registro exitoso!</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: 0 }}>
              Tus datos quedaron registrados en GymOne. El administrador se pondrá en contacto contigo para activar tu membresía.
            </p>
          </Card>
        ) : (
          <Card>
            <h1 style={{ margin: '0 0 6px' }}>Regístrate en GymOne</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: '0 0 24px' }}>
              Completa tus datos para unirte al gimnasio. Todos los campos son obligatorios.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={fieldGrid}>
                <Input label="Primer nombre" required value={form.primerNombre} onChange={(e) => handleChange('primerNombre', e.target.value)} />
                <Input label="Segundo nombre" required value={form.segundoNombre} onChange={(e) => handleChange('segundoNombre', e.target.value)} />
                <Input label="Documento" required value={form.documento} onChange={(e) => handleChange('documento', e.target.value)} />
                <Input label="Fecha de nacimiento" type="date" required value={form.fechaNacimiento} onChange={(e) => handleChange('fechaNacimiento', e.target.value)} />
                <Input label="Teléfono" required value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} />
                <Input label="Correo" type="email" required value={form.correo} onChange={(e) => handleChange('correo', e.target.value)} />
              </div>

              <Input label="Dirección" required value={form.direccion} onChange={(e) => handleChange('direccion', e.target.value)} />

              <div style={fieldGrid}>
                <Input label="Contacto de emergencia" required value={form.contactoEmergenciaNombre} onChange={(e) => handleChange('contactoEmergenciaNombre', e.target.value)} />
                <Input label="Teléfono de emergencia" required value={form.contactoEmergenciaTelefono} onChange={(e) => handleChange('contactoEmergenciaTelefono', e.target.value)} />
                <Input label="EPS" required value={form.eps} onChange={(e) => handleChange('eps', e.target.value)} />
                <Input label="Objetivo" required value={form.objetivo} onChange={(e) => handleChange('objetivo', e.target.value)} />
                <Input label="Peso (kg)" type="number" step="0.1" required value={form.pesoKg} onChange={(e) => handleChange('pesoKg', e.target.value)} />
                <Input label="Altura (cm)" type="number" step="0.1" required value={form.alturaCm} onChange={(e) => handleChange('alturaCm', e.target.value)} />
              </div>

              <Button type="submit" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? 'Enviando...' : 'Registrarme'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}

const fieldGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
}
