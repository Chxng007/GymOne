import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { listarAsistenciaHoy, registrarEntrada, registrarSalida } from '../../services/asistenciaService'
import { listarClientes } from '../../services/clientesService'

export function Asistencia() {
  const { showToast } = useToast()
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [loading, setLoading] = useState(true)

  async function cargarHoy() {
    setLoading(true)
    try {
      setAsistencias(await listarAsistenciaHoy())
    } catch {
      showToast('No se pudo cargar la asistencia de hoy', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarHoy()
  }, [])

  async function handleBuscar(e) {
    e.preventDefault()
    if (!busqueda.trim()) {
      setResultados([])
      return
    }
    try {
      setResultados(await listarClientes(busqueda))
    } catch {
      showToast('No se pudo buscar clientes', 'danger')
    }
  }

  async function handleEntrada(clienteId) {
    try {
      await registrarEntrada(clienteId)
      showToast('Entrada registrada', 'success')
      cargarHoy()
    } catch (err) {
      showToast(err.response?.data?.error ?? 'No se pudo registrar la entrada', 'danger')
    }
  }

  async function handleSalida(id) {
    try {
      await registrarSalida(id)
      showToast('Salida registrada', 'success')
      cargarHoy()
    } catch {
      showToast('No se pudo registrar la salida', 'danger')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px' }}>Gestión de asistencia</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: 0 }}>Registros de ingreso y salida de clientes en el día.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, alignItems: 'start' }}>
        <Card title="Registro de ingreso">
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '-8px 0 18px' }}>
            Busca por nombre o documento para verificar el estado de la membresía.
          </p>
          <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 8, marginBottom: resultados.length ? 'var(--spacing-3)' : 0 }}>
            <Input placeholder="Nombre o documento" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ flex: 1 }} />
            <Button type="submit">Buscar</Button>
          </form>

          {resultados.length > 0 && (
            <Table
              columns={[
                {
                  key: 'nombre',
                  header: 'Nombre',
                  render: (row) => `${row.primerNombre} ${row.segundoNombre ?? ''}`.trim(),
                },
                { key: 'documento', header: 'Documento' },
                {
                  key: 'acciones',
                  header: '',
                  render: (row) => (
                    <Button onClick={() => handleEntrada(row.id)} style={{ padding: '8px 12px', fontSize: 12.5 }}>
                      Registrar entrada
                    </Button>
                  ),
                },
              ]}
              data={resultados}
            />
          )}
        </Card>

        <Card title="Registro de hoy" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '0 24px 20px' }}>Cargando...</p>
          ) : (
            <Table
              columns={[
                { key: 'clienteNombre', header: 'Cliente' },
                {
                  key: 'horaEntrada',
                  header: 'Entrada',
                  render: (row) => new Date(row.horaEntrada).toLocaleTimeString('es-CO'),
                },
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
                      <Button variant="secondary" onClick={() => handleSalida(row.id)} style={{ padding: '8px 12px', fontSize: 12.5 }}>
                        Registrar salida
                      </Button>
                    ),
                },
              ]}
              data={asistencias}
              emptyMessage="Sin asistencia registrada hoy"
            />
          )}
        </Card>
      </div>
    </div>
  )
}
