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
      <h1>Asistencia</h1>

      <Card title="Buscar cliente" style={{ marginBottom: 'var(--spacing-4)' }}>
        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 8, marginBottom: resultados.length ? 'var(--spacing-3)' : 0 }}>
          <Input
            placeholder="Nombre o documento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
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
                render: (row) => <Button onClick={() => handleEntrada(row.id)}>Registrar entrada</Button>,
              },
            ]}
            data={resultados}
          />
        )}
      </Card>

      <h2>Asistencia de hoy</h2>
      {loading ? (
        <p>Cargando...</p>
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
                  <Button variant="secondary" onClick={() => handleSalida(row.id)}>
                    Registrar salida
                  </Button>
                ),
            },
          ]}
          data={asistencias}
          emptyMessage="Sin asistencia registrada hoy"
        />
      )}
    </div>
  )
}
