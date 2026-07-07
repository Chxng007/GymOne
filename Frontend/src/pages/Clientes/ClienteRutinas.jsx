import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useToast } from '../../context/ToastContext'
import { listarEntrenadores } from '../../services/entrenadoresService'
import { crearRutina, eliminarRutina, listarRutinasPorCliente } from '../../services/rutinasService'

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const EJERCICIO_VACIO = { ejercicio: '', series: '3', repeticiones: '10', peso: '', descansoSegundos: '', notas: '', videoUrl: '' }

export function ClienteRutinas({ clienteId }) {
  const { showToast } = useToast()
  const [rutinas, setRutinas] = useState([])
  const [entrenadores, setEntrenadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [creando, setCreando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nombre, setNombre] = useState('')
  const [entrenadorId, setEntrenadorId] = useState('')
  const [dias, setDias] = useState([])

  async function cargar() {
    setLoading(true)
    try {
      const [r, e] = await Promise.all([listarRutinasPorCliente(clienteId), listarEntrenadores()])
      setRutinas(r)
      setEntrenadores(e)
    } catch {
      showToast('No se pudo cargar la información de rutinas', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId])

  function iniciarCreacion() {
    setNombre('')
    setEntrenadorId('')
    setDias([{ dia: 'Lunes', ejercicios: [{ ...EJERCICIO_VACIO }] }])
    setCreando(true)
  }

  function agregarDia() {
    setDias((current) => [...current, { dia: 'Lunes', ejercicios: [{ ...EJERCICIO_VACIO }] }])
  }

  function quitarDia(index) {
    setDias((current) => current.filter((_, i) => i !== index))
  }

  function actualizarDia(index, campo, valor) {
    setDias((current) => current.map((d, i) => (i === index ? { ...d, [campo]: valor } : d)))
  }

  function agregarEjercicio(diaIndex) {
    setDias((current) =>
      current.map((d, i) => (i === diaIndex ? { ...d, ejercicios: [...d.ejercicios, { ...EJERCICIO_VACIO }] } : d)),
    )
  }

  function quitarEjercicio(diaIndex, ejIndex) {
    setDias((current) =>
      current.map((d, i) => (i === diaIndex ? { ...d, ejercicios: d.ejercicios.filter((_, j) => j !== ejIndex) } : d)),
    )
  }

  function actualizarEjercicio(diaIndex, ejIndex, campo, valor) {
    setDias((current) =>
      current.map((d, i) =>
        i === diaIndex
          ? { ...d, ejercicios: d.ejercicios.map((ej, j) => (j === ejIndex ? { ...ej, [campo]: valor } : ej)) }
          : d,
      ),
    )
  }

  async function handleGuardar() {
    setSaving(true)
    try {
      await crearRutina({
        clienteId: Number(clienteId),
        entrenadorId: entrenadorId ? Number(entrenadorId) : null,
        nombre,
        dias: dias.map((d) => ({
          dia: d.dia,
          ejercicios: d.ejercicios.map((ej) => ({
            ejercicio: ej.ejercicio,
            series: Number(ej.series),
            repeticiones: Number(ej.repeticiones),
            peso: ej.peso === '' ? null : Number(ej.peso),
            descansoSegundos: ej.descansoSegundos === '' ? null : Number(ej.descansoSegundos),
            notas: ej.notas || null,
            videoUrl: ej.videoUrl || null,
          })),
        })),
      })
      showToast('Rutina creada', 'success')
      setCreando(false)
      cargar()
    } catch {
      showToast('No se pudo crear la rutina', 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar esta rutina?')) return
    try {
      await eliminarRutina(id)
      showToast('Rutina eliminada', 'success')
      cargar()
    } catch {
      showToast('No se pudo eliminar la rutina', 'danger')
    }
  }

  if (loading) return <p>Cargando...</p>

  if (creando) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--spacing-3)' }}>
          <Input label="Nombre de la rutina" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Select
            label="Entrenador"
            value={entrenadorId}
            onChange={(e) => setEntrenadorId(e.target.value)}
            options={[{ value: '', label: 'Sin asignar' }, ...entrenadores.map((e) => ({ value: e.id, label: e.nombre }))]}
          />
        </div>

        {dias.map((dia, diaIndex) => (
          <Card key={diaIndex} style={{ marginBottom: 'var(--spacing-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-2)' }}>
              <Select label="Día" value={dia.dia} onChange={(e) => actualizarDia(diaIndex, 'dia', e.target.value)} options={DIAS_SEMANA.map((d) => ({ value: d, label: d }))} />
              <Button variant="secondary" onClick={() => quitarDia(diaIndex)}>
                Quitar día
              </Button>
            </div>

            {dia.ejercicios.map((ej, ejIndex) => (
              <div key={ejIndex} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                <Input label="Ejercicio" required value={ej.ejercicio} onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, 'ejercicio', e.target.value)} />
                <Input label="Series" type="number" value={ej.series} onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, 'series', e.target.value)} style={{ width: 70 }} />
                <Input label="Reps" type="number" value={ej.repeticiones} onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, 'repeticiones', e.target.value)} style={{ width: 70 }} />
                <Input label="Peso" type="number" value={ej.peso} onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, 'peso', e.target.value)} style={{ width: 80 }} />
                <Input label="Descanso (s)" type="number" value={ej.descansoSegundos} onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, 'descansoSegundos', e.target.value)} style={{ width: 100 }} />
                <Input label="Notas" value={ej.notas} onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, 'notas', e.target.value)} />
                <Button variant="secondary" onClick={() => quitarEjercicio(diaIndex, ejIndex)}>
                  Quitar
                </Button>
              </div>
            ))}

            <Button variant="secondary" onClick={() => agregarEjercicio(diaIndex)}>
              Agregar ejercicio
            </Button>
          </Card>
        ))}

        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={agregarDia}>
            Agregar día
          </Button>
          <Button onClick={handleGuardar} disabled={saving || !nombre || dias.length === 0}>
            {saving ? 'Guardando...' : 'Guardar rutina'}
          </Button>
          <Button variant="secondary" onClick={() => setCreando(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <Button onClick={iniciarCreacion}>Nueva rutina</Button>
      </div>

      {rutinas.length === 0 && <p>Este cliente no tiene rutinas registradas</p>}

      {rutinas.map((rutina) => (
        <Card key={rutina.id} style={{ marginBottom: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: 0 }}>{rutina.nombre}</h3>
              <p style={{ color: 'var(--color-text-muted)', margin: '4px 0' }}>
                {rutina.entrenadorNombre ? `Entrenador: ${rutina.entrenadorNombre} — ` : ''}
                Desde {rutina.fechaInicio}
              </p>
            </div>
            <Button variant="secondary" onClick={() => handleEliminar(rutina.id)}>
              Eliminar
            </Button>
          </div>

          {rutina.dias.map((dia) => (
            <div key={dia.id} style={{ marginTop: 'var(--spacing-2)' }}>
              <strong>{dia.dia}</strong>
              <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
                {dia.ejercicios.map((ej) => (
                  <li key={ej.id}>
                    {ej.ejercicio} — {ej.series}x{ej.repeticiones}
                    {ej.peso ? ` @ ${ej.peso}kg` : ''}
                    {ej.descansoSegundos ? ` — descanso ${ej.descansoSegundos}s` : ''}
                    {ej.notas ? ` — ${ej.notas}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Card>
      ))}
    </div>
  )
}
