import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { listarPlanes } from '../../services/planesService'
import {
  congelarSuscripcion,
  crearSuscripcion,
  listarSuscripcionesPorCliente,
  renovarSuscripcion,
} from '../../services/suscripcionesService'

const ESTADO_VARIANT = {
  ACTIVA: 'success',
  CONGELADA: 'warning',
  VENCIDA: 'danger',
  CANCELADA: 'neutral',
}

export function ClienteMembresias({ clienteId }) {
  const { showToast } = useToast()
  const [suscripciones, setSuscripciones] = useState([])
  const [planes, setPlanes] = useState([])
  const [planId, setPlanId] = useState('')
  const [loading, setLoading] = useState(true)
  const [asignando, setAsignando] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      const [sus, pln] = await Promise.all([
        listarSuscripcionesPorCliente(clienteId),
        listarPlanes(true),
      ])
      setSuscripciones(sus)
      setPlanes(pln)
      if (pln.length > 0) setPlanId((current) => current || String(pln[0].id))
    } catch {
      showToast('No se pudo cargar la información de membresía', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId])

  async function handleAsignar() {
    if (!planId) return
    setAsignando(true)
    try {
      await crearSuscripcion({ clienteId: Number(clienteId), planId: Number(planId) })
      showToast('Plan asignado', 'success')
      cargar()
    } catch {
      showToast('No se pudo asignar el plan', 'danger')
    } finally {
      setAsignando(false)
    }
  }

  async function handleCongelar(id) {
    try {
      await congelarSuscripcion(id)
      showToast('Suscripción congelada', 'success')
      cargar()
    } catch {
      showToast('No se pudo congelar la suscripción', 'danger')
    }
  }

  async function handleRenovar(id) {
    try {
      await renovarSuscripcion(id)
      showToast('Suscripción renovada', 'success')
      cargar()
    } catch {
      showToast('No se pudo renovar la suscripción', 'danger')
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 'var(--spacing-3)' }}>
        <Select
          label="Asignar plan"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          options={planes.map((p) => ({ value: p.id, label: p.nombre }))}
        />
        <Button onClick={handleAsignar} disabled={asignando || planes.length === 0}>
          {asignando ? 'Asignando...' : 'Asignar'}
        </Button>
      </div>

      <Table
        columns={[
          { key: 'planNombre', header: 'Plan' },
          { key: 'fechaInicio', header: 'Inicio' },
          { key: 'fechaFin', header: 'Vence' },
          {
            key: 'estado',
            header: 'Estado',
            render: (row) => <Badge variant={ESTADO_VARIANT[row.estado]}>{row.estado}</Badge>,
          },
          {
            key: 'acciones',
            header: '',
            render: (row) => (
              <div style={{ display: 'flex', gap: 8 }}>
                {row.estado !== 'CONGELADA' && (
                  <Button variant="secondary" onClick={() => handleCongelar(row.id)}>
                    Congelar
                  </Button>
                )}
                <Button variant="secondary" onClick={() => handleRenovar(row.id)}>
                  Renovar
                </Button>
              </div>
            ),
          },
        ]}
        data={suscripciones}
        emptyMessage="Este cliente no tiene membresías asignadas"
      />
    </div>
  )
}
