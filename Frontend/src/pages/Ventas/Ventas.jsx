import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import { listarProductos } from '../../services/productosService'
import { crearVenta, listarVentas } from '../../services/ventasService'

const METODO_OPTIONS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transf.' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'DAVIPLATA', label: 'Daviplata' },
]

function thumbStyle() {
  return {
    width: '100%',
    height: 92,
    background: 'repeating-linear-gradient(135deg, var(--color-border-subtle), var(--color-border-subtle) 6px, var(--color-surface) 6px, var(--color-surface) 12px)',
    borderBottom: '1px solid var(--color-border)',
  }
}

export function Ventas() {
  const { showToast } = useToast()
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [carrito, setCarrito] = useState([])
  const [descuento, setDescuento] = useState('0')
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [saving, setSaving] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      const [prods, vts] = await Promise.all([listarProductos(), listarVentas()])
      setProductos(prods)
      setVentas(vts)
    } catch {
      showToast('No se pudo cargar la información', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  function agregarAlCarrito(producto) {
    setCarrito((current) => {
      const existente = current.find((i) => i.productoId === producto.id)
      if (existente) {
        return current.map((i) => (i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      }
      return [...current, { productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }]
    })
  }

  function incQty(productoId) {
    setCarrito((current) => current.map((i) => (i.productoId === productoId ? { ...i, cantidad: i.cantidad + 1 } : i)))
  }

  function decQty(productoId) {
    setCarrito((current) =>
      current
        .map((i) => (i.productoId === productoId ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0),
    )
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26 }}>Punto de venta</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 20px' }}>Selecciona productos para agregarlos al carrito.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {productos.map((prod) => (
              <Card key={prod.id} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={thumbStyle()} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 14.5, marginBottom: 8 }}>{prod.nombre}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: 15 }}>${Number(prod.precio).toLocaleString('es-CO')}</span>
                    <button
                      type="button"
                      onClick={() => agregarAlCarrito(prod)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: 'var(--color-surface-alt)',
                        border: 'none',
                        color: 'var(--color-primary-strong)',
                        fontSize: 17,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            {productos.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No hay productos registrados</p>}
          </div>
        </div>

        <Card style={{ padding: 22, position: 'sticky', top: 0 }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display)', marginBottom: 14 }}>
            Carrito actual
          </div>

          {carrito.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: 13.5, textAlign: 'center', padding: '30px 0' }}>Agrega productos al carrito</div>
          ) : (
            carrito.map((item) => (
              <div key={item.productoId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13.5 }}>{item.nombre}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <button type="button" onClick={() => decQty(item.productoId)} style={stepperStyle}>−</button>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 13, minWidth: 14, textAlign: 'center' }}>{item.cantidad}</span>
                    <button type="button" onClick={() => incQty(item.productoId)} style={stepperStyle}>+</button>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
              </div>
            ))
          )}

          <div style={{ marginTop: 16 }}>
            <Input label="Descuento" type="number" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: 13.5 }}>
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--color-text)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: 'var(--color-accent)' }}>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '18px 0' }}>
            {METODO_OPTIONS.map((m) => {
              const active = metodoPago === m.value
              return (
                <div
                  key={m.value}
                  onClick={() => setMetodoPago(m.value)}
                  style={{
                    textAlign: 'center',
                    padding: '11px 6px',
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: active ? 'var(--color-surface-alt)' : 'var(--color-input-bg)',
                    color: active ? 'var(--color-primary-strong)' : 'var(--color-text-muted)',
                    border: active ? '1.5px solid var(--color-primary-strong)' : '1px solid var(--color-border-input)',
                  }}
                >
                  {m.label}
                </div>
              )
            })}
          </div>

          <Button
            onClick={handleRegistrarVenta}
            disabled={saving || carrito.length === 0}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {saving ? 'Registrando...' : 'Completar venta'}
          </Button>
        </Card>
      </div>

      <h2 style={{ marginTop: 32 }}>Historial de ventas</h2>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
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
      </Card>
    </div>
  )
}

const stepperStyle = {
  width: 22,
  height: 22,
  borderRadius: 6,
  background: 'var(--color-surface-alt)',
  border: 'none',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
}
