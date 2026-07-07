import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { listarProductos } from '../../services/productosService'
import { crearVenta, listarVentas } from '../../services/ventasService'

const METODO_OPTIONS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'DAVIPLATA', label: 'Daviplata' },
]

export function Ventas() {
  const { showToast } = useToast()
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [carrito, setCarrito] = useState([])
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('1')
  const [descuento, setDescuento] = useState('0')
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [saving, setSaving] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      const [prods, vts] = await Promise.all([listarProductos(), listarVentas()])
      setProductos(prods)
      setVentas(vts)
      if (prods.length > 0) setProductoId((current) => current || String(prods[0].id))
    } catch {
      showToast('No se pudo cargar la información', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  function agregarAlCarrito() {
    const producto = productos.find((p) => String(p.id) === String(productoId))
    if (!producto) return

    setCarrito((current) => {
      const existente = current.find((i) => i.productoId === producto.id)
      if (existente) {
        return current.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + Number(cantidad) } : i,
        )
      }
      return [
        ...current,
        { productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: Number(cantidad) },
      ]
    })
  }

  function quitarDelCarrito(productoId) {
    setCarrito((current) => current.filter((i) => i.productoId !== productoId))
  }

  const subtotal = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const total = Math.max(0, subtotal - Number(descuento || 0))

  async function handleRegistrarVenta() {
    if (carrito.length === 0) return
    setSaving(true)
    try {
      await crearVenta({
        items: carrito.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        descuento: Number(descuento || 0),
        metodoPago,
      })
      showToast('Venta registrada', 'success')
      setCarrito([])
      setDescuento('0')
      cargar()
    } catch (err) {
      showToast(err.response?.data?.error ?? 'No se pudo registrar la venta', 'danger')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      <h1>Ventas</h1>

      <Card title="Punto de venta" style={{ marginBottom: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 'var(--spacing-3)' }}>
          <Select
            label="Producto"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            options={productos.map((p) => ({ value: p.id, label: `${p.nombre} ($${Number(p.precio).toLocaleString('es-CO')})` }))}
          />
          <Input label="Cantidad" type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          <Button type="button" onClick={agregarAlCarrito}>
            Agregar
          </Button>
        </div>

        <Table
          columns={[
            { key: 'nombre', header: 'Producto' },
            { key: 'cantidad', header: 'Cantidad' },
            { key: 'precio', header: 'Precio unit.', render: (row) => `$${Number(row.precio).toLocaleString('es-CO')}` },
            {
              key: 'subtotal',
              header: 'Subtotal',
              render: (row) => `$${(row.precio * row.cantidad).toLocaleString('es-CO')}`,
            },
            {
              key: 'acciones',
              header: '',
              render: (row) => (
                <Button variant="secondary" onClick={() => quitarDelCarrito(row.productoId)}>
                  Quitar
                </Button>
              ),
            },
          ]}
          data={carrito}
          emptyMessage="Agrega productos al carrito"
        />

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 'var(--spacing-3)' }}>
          <Input label="Descuento" type="number" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
          <Select label="Método de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} options={METODO_OPTIONS} />
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Total: ${total.toLocaleString('es-CO')}</p>
          <Button type="button" onClick={handleRegistrarVenta} disabled={saving || carrito.length === 0}>
            {saving ? 'Registrando...' : 'Registrar venta'}
          </Button>
        </div>
      </Card>

      <h2>Historial de ventas</h2>
      <Table
        columns={[
          { key: 'fecha', header: 'Fecha', render: (row) => new Date(row.fecha).toLocaleString('es-CO') },
          {
            key: 'items',
            header: 'Productos',
            render: (row) => row.items.map((i) => `${i.productoNombre} x${i.cantidad}`).join(', '),
          },
          { key: 'descuento', header: 'Descuento', render: (row) => `$${Number(row.descuento).toLocaleString('es-CO')}` },
          { key: 'total', header: 'Total', render: (row) => `$${Number(row.total).toLocaleString('es-CO')}` },
          { key: 'metodoPago', header: 'Método' },
          { key: 'registradoPorNombre', header: 'Registrado por' },
        ]}
        data={ventas}
        emptyMessage="No hay ventas registradas"
      />
    </div>
  )
}
