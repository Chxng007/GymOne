import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { eliminarCliente, listarClientes } from '../../services/clientesService'

const ESTADO_VARIANT = {
  ACTIVO: 'success',
  SUSPENDIDO: 'warning',
  VENCIDO: 'danger',
}

const FILTROS = ['Todos', 'Activos', 'Suspendidos', 'Vencidos']
const FILTRO_ESTADO = { Activos: 'ACTIVO', Suspendidos: 'SUSPENDIDO', Vencidos: 'VENCIDO' }

export function Clientes() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('Todos')
  const [loading, setLoading] = useState(true)

  async function cargar(texto) {
    setLoading(true)
    try {
      const data = await listarClientes(texto)
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

  async function handleCopiarEnlace() {
    const url = `${window.location.origin}/registro`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Enlace de registro copiado al portapapeles', 'success')
    } catch {
      showToast(url, 'neutral')
    }
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

  const stats = useMemo(
    () => ({
      total: clientes.length,
      activos: clientes.filter((c) => c.estado === 'ACTIVO').length,
      suspendidos: clientes.filter((c) => c.estado === 'SUSPENDIDO').length,
      vencidos: clientes.filter((c) => c.estado === 'VENCIDO').length,
    }),
    [clientes],
  )

  const filtrados = filtro === 'Todos' ? clientes : clientes.filter((c) => c.estado === FILTRO_ESTADO[filtro])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Clientes</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: 0 }}>Administra y monitorea la comunidad de miembros de tu gimnasio.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={handleCopiarEnlace}>
            Compartir enlace de registro
          </Button>
          <Button onClick={() => navigate('/clientes/nuevo')}>Nuevo cliente</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        <Card style={{ padding: '20px 22px' }}>
          <StatLabel>Total clientes</StatLabel>
          <StatValue>{stats.total}</StatValue>
        </Card>
        <Card style={{ padding: '20px 22px' }}>
          <StatLabel>Activos</StatLabel>
          <StatValue color="var(--color-success)">{stats.activos}</StatValue>
        </Card>
        <Card style={{ padding: '20px 22px' }}>
          <StatLabel>Suspendidos</StatLabel>
          <StatValue color="var(--color-warning)">{stats.suspendidos}</StatValue>
        </Card>
        <Card style={{ padding: '20px 22px' }}>
          <StatLabel>Vencidos</StatLabel>
          <StatValue color="var(--color-danger)">{stats.vencidos}</StatValue>
        </Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {FILTROS.map((label) => {
            const active = filtro === label
            return (
              <span
                key={label}
                onClick={() => setFiltro(label)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 9,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: active ? 'var(--color-primary-on)' : 'var(--color-text-secondary)',
                  border: active ? 'none' : '1px solid var(--color-border-input)',
                }}
              >
                {label}
              </span>
            )
          })}
        </div>
        <form onSubmit={handleSearchSubmit} style={{ width: 280 }}>
          <Input placeholder="Buscar por nombre o documento" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </form>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
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
            data={filtrados}
            emptyMessage="No hay clientes registrados"
          />
        </Card>
      )}
    </div>
  )
}

function StatLabel({ children }) {
  return (
    <div style={{ color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-display)', marginBottom: 10 }}>
      {children}
    </div>
  )
}

function StatValue({ children, color }) {
  return (
    <div style={{ fontSize: 26, fontWeight: 800, color: color ?? 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{children}</div>
  )
}
