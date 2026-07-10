import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { listarPagos, notificarPago } from '../../services/pagosService'
import { PagoForm } from './PagoForm'

export function Pagos() {
  const { showToast } = useToast()
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [notificandoId, setNotificandoId] = useState(null)

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

  async function handleNotificar(id) {
    setNotificandoId(id)
    try {
      await notificarPago(id)
      showToast('Notificación de pago enviada al cliente', 'success')
      cargar()
    } catch (err) {
      showToast(err.response?.data?.error ?? 'No se pudo enviar la notificación', 'danger')
    } finally {
      setNotificandoId(null)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Pagos</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: '0 0 26px' }}>Registra y consulta los pagos de membresías y servicios.</p>

      <Card title="Registrar pago" style={{ marginBottom: 'var(--spacing-4)' }}>
        <PagoForm onSaved={cargar} />
      </Card>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={[
              { key: 'clienteNombre', header: 'Cliente' },
              { key: 'tipo', header: 'Tipo' },
              { key: 'metodo', header: 'Método' },
              {
                key: 'monto',
                header: 'Monto',
                render: (row) => <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>${Number(row.monto).toLocaleString('es-CO')}</span>,
              },
              {
                key: 'fecha',
                header: 'Fecha',
                render: (row) => new Date(row.fecha).toLocaleString('es-CO'),
              },
              { key: 'registradoPorNombre', header: 'Registrado por' },
              { key: 'nota', header: 'Nota' },
              {
                key: 'notificacion',
                header: '',
                render: (row) =>
                  row.notificado ? (
                    <Badge variant="success">Notificado</Badge>
                  ) : row.clienteTieneCorreo ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleNotificar(row.id)}
                      disabled={notificandoId === row.id}
                      style={{ padding: '7px 12px', fontSize: 12.5 }}
                    >
                      {notificandoId === row.id ? 'Enviando...' : 'Notificar pago'}
                    </Button>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 12.5 }}>Sin correo</span>
                  ),
              },
            ]}
            data={pagos}
            emptyMessage="No hay pagos registrados"
          />
        </Card>
      )}
    </div>
  )
}
