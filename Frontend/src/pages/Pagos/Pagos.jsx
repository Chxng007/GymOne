import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { listarPagos } from '../../services/pagosService'
import { PagoForm } from './PagoForm'

export function Pagos() {
  const { showToast } = useToast()
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)

  async function cargar() {
    setLoading(true)
    try {
      setPagos(await listarPagos())
    } catch {
      showToast('No se pudo cargar el historial de pagos', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div>
      <h1>Pagos</h1>

      <Card title="Registrar pago" style={{ marginBottom: 'var(--spacing-4)' }}>
        <PagoForm onSaved={cargar} />
      </Card>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { key: 'clienteNombre', header: 'Cliente' },
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
            { key: 'registradoPorNombre', header: 'Registrado por' },
            { key: 'nota', header: 'Nota' },
          ]}
          data={pagos}
          emptyMessage="No hay pagos registrados"
        />
      )}
    </div>
  )
}
