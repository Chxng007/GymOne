import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { eliminarCliente, listarClientes } from '../../services/clientesService'

const ESTADO_VARIANT = {
  ACTIVO: 'success',
  SUSPENDIDO: 'warning',
  VENCIDO: 'danger',
}

export function Clientes() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  async function cargar(filtro) {
    setLoading(true)
    try {
      const data = await listarClientes(filtro)
      setClientes(data)
    } catch {
      showToast('No se pudo cargar la lista de clientes', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    cargar(busqueda)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este cliente?')) return
    try {
      await eliminarCliente(id)
      showToast('Cliente eliminado', 'success')
      cargar(busqueda)
    } catch {
      showToast('No se pudo eliminar el cliente', 'danger')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h1 style={{ margin: 0 }}>Clientes</h1>
        <Button onClick={() => navigate('/clientes/nuevo')}>Nuevo cliente</Button>
      </div>

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 'var(--spacing-3)', maxWidth: 320 }}>
        <Input
          placeholder="Buscar por nombre o documento"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            {
              key: 'nombre',
              header: 'Nombre',
              render: (row) => `${row.primerNombre} ${row.segundoNombre ?? ''}`.trim(),
            },
            { key: 'documento', header: 'Documento' },
            { key: 'edad', header: 'Edad' },
            { key: 'telefono', header: 'Teléfono' },
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
                  <Button variant="secondary" onClick={() => navigate(`/clientes/${row.id}`)}>
                    Editar
                  </Button>
                  <Button variant="secondary" onClick={() => handleDelete(row.id)}>
                    Eliminar
                  </Button>
                </div>
              ),
            },
          ]}
          data={clientes}
          emptyMessage="No hay clientes registrados"
        />
      )}
    </div>
  )
}
