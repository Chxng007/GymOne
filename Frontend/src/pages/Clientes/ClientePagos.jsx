import { useEffect, useState } from 'react'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { listarPagos } from '../../services/pagosService'
import { PagoForm } from '../Pagos/PagoForm'

export function ClientePagos({ clienteId }) {
  const { showToast } = useToast()
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)

  async function cargar() {
    setLoading(true)
    try {
      setPagos(await listarPagos(clienteId))
    } catch {
      showToast('No se pudo cargar el historial de pagos', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId])

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <PagoForm clienteId={clienteId} onSaved={cargar} />
      </div>

      <Table
        columns={[
          { key: 'tipo', header: 'Tipo' },
          { key: 'metodo', header: 'Método' },
          {
            key: 'monto',
            header: 'Monto',
            render: (row) => `$${Number(row.monto).toLocaleString('es-CO')}`,
          },
          {
            key: 'fecha',
            header: 'Fecha',
            render: (row) => new Date(row.fecha).toLocaleString('es-CO'),
          },
          { key: 'nota', header: 'Nota' },
        ]}
        data={pagos}
        emptyMessage="Este cliente no tiene pagos registrados"
      />
    </div>
  )
}
