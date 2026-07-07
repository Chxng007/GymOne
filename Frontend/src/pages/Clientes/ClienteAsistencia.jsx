import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { listarAsistenciaPorCliente, registrarEntrada, registrarSalida } from '../../services/asistenciaService'

export function ClienteAsistencia({ clienteId }) {
  const { showToast } = useToast()
  const [asistencias, setAsistencias] = useState([])
  const [loading, setLoading] = useState(true)

  async function cargar() {
    setLoading(true)
    try {
      setAsistencias(await listarAsistenciaPorCliente(clienteId))
    } catch {
      showToast('No se pudo cargar la asistencia', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId])

  async function handleEntrada() {
    try {
      await registrarEntrada(clienteId)
      showToast('Entrada registrada', 'success')
      cargar()
    } catch (err) {
      showToast(err.response?.data?.error ?? 'No se pudo registrar la entrada', 'danger')
    }
  }

  async function handleSalida(id) {
    try {
      await registrarSalida(id)
      showToast('Salida registrada', 'success')
      cargar()
    } catch {
      showToast('No se pudo registrar la salida', 'danger')
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <Button onClick={handleEntrada}>Registrar entrada hoy</Button>
      </div>

      <Table
        columns={[
          { key: 'fecha', header: 'Fecha' },
          { key: 'horaEntrada', header: 'Entrada', render: (row) => new Date(row.horaEntrada).toLocaleTimeString('es-CO') },
          {
            key: 'horaSalida',
            header: 'Salida',
            render: (row) => (row.horaSalida ? new Date(row.horaSalida).toLocaleTimeString('es-CO') : '—'),
          },
          {
            key: 'acciones',
            header: '',
            render: (row) =>
              !row.horaSalida && (
                <Button variant="secondary" onClick={() => handleSalida(row.id)}>
                  Registrar salida
                </Button>
              ),
          },
        ]}
        data={asistencias}
        emptyMessage="Este cliente no tiene asistencia registrada"
      />
    </div>
  )
}
