import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/ui/Table'
import { useToast } from '../../context/ToastContext'
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from '../../services/productosService'

const CATEGORIA_OPTIONS = [
  { value: 'PROTEINA', label: 'Proteína' },
  { value: 'CREATINA', label: 'Creatina' },
  { value: 'ACCESORIO', label: 'Accesorio' },
  { value: 'BEBIDA', label: 'Bebida' },
  { value: 'SNACK', label: 'Snack' },
]

const TABS = ['Todos', ...CATEGORIA_OPTIONS.map((c) => c.label)]

const EMPTY_FORM = { nombre: '', categoria: 'PROTEINA', costo: '', precio: '', stock: '', proveedor: '' }

export function Inventario() {
  const { showToast } = useToast()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('Todos')

  async function cargar() {
    setLoading(true)
    try {
      setProductos(await listarProductos())
    } catch {
      showToast('No se pudieron cargar los productos', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  function abrirNuevo() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function abrirEditar(producto) {
    setEditingId(producto.id)
    setForm({
      nombre: producto.nombre,
      categoria: producto.categoria,
      costo: producto.costo,
      precio: producto.precio,
      stock: producto.stock,
      proveedor: producto.proveedor ?? '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      nombre: form.nombre,
      categoria: form.categoria,
      costo: Number(form.costo),
      precio: Number(form.precio),
      stock: Number(form.stock),
      proveedor: form.proveedor || null,
    }

    try {
      if (editingId) {
        await actualizarProducto(editingId, payload)
        showToast('Producto actualizado', 'success')
      } else {
        await crearProducto(payload)
        showToast('Producto creado', 'success')
      }
      setModalOpen(false)
      cargar()
    } catch {
      showToast('No se pudo guardar el producto', 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await eliminarProducto(id)
      showToast('Producto eliminado', 'success')
      cargar()
    } catch {
      showToast('No se pudo eliminar el producto', 'danger')
    }
  }

  const stats = useMemo(
    () => ({
      totalSku: productos.length,
      stockBajo: productos.filter((p) => p.stock <= 3).length,
      valorStock: productos.reduce((acc, p) => acc + Number(p.precio) * Number(p.stock), 0),
    }),
    [productos],
  )

  const categoriaLabel = (value) => CATEGORIA_OPTIONS.find((c) => c.value === value)?.label ?? value
  const filtrados = tab === 'Todos' ? productos : productos.filter((p) => categoriaLabel(p.categoria) === tab)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Inventario</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, margin: 0 }}>Administra suplementos, ropa deportiva y esenciales del gimnasio.</p>
        </div>
        <Button onClick={abrirNuevo}>Nuevo producto</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 22 }}>
        <Card style={{ padding: '20px 22px' }}>
          <StatLabel>Total SKU</StatLabel>
          <StatValue>{stats.totalSku}</StatValue>
        </Card>
        <Card style={{ padding: '20px 22px' }}>
          <StatLabel>Alertas stock bajo</StatLabel>
          <StatValue color={stats.stockBajo > 0 ? 'var(--color-danger)' : undefined}>{stats.stockBajo}</StatValue>
        </Card>
        <Card style={{ padding: '20px 22px' }}>
          <StatLabel>Valor de stock</StatLabel>
          <StatValue>${stats.valorStock.toLocaleString('es-CO')}</StatValue>
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, padding: '18px 24px', borderBottom: '1px solid var(--color-border)' }}>
          {TABS.map((label) => {
            const active = tab === label
            return (
              <span
                key={label}
                onClick={() => setTab(label)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: active ? 'var(--color-primary)' : 'var(--color-input-bg)',
                  color: active ? 'var(--color-primary-on)' : 'var(--color-text-secondary)',
                  border: active ? 'none' : '1px solid var(--color-border-input)',
                }}
              >
                {label}
              </span>
            )
          })}
        </div>

        {loading ? (
          <p style={{ padding: 24 }}>Cargando...</p>
        ) : (
          <Table
            columns={[
              { key: 'nombre', header: 'Nombre' },
              { key: 'categoria', header: 'Categoría', render: (row) => categoriaLabel(row.categoria) },
              { key: 'costo', header: 'Costo', render: (row) => `$${Number(row.costo).toLocaleString('es-CO')}` },
              { key: 'precio', header: 'Precio', render: (row) => `$${Number(row.precio).toLocaleString('es-CO')}` },
              {
                key: 'stock',
                header: 'Stock',
                render: (row) => <Badge variant={row.stock <= 3 ? 'danger' : 'success'}>{row.stock}</Badge>,
              },
              { key: 'proveedor', header: 'Proveedor' },
              {
                key: 'acciones',
                header: '',
                render: (row) => (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" onClick={() => abrirEditar(row)}>
                      Editar
                    </Button>
                    <Button variant="secondary" onClick={() => handleEliminar(row.id)}>
                      Eliminar
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filtrados}
            emptyMessage="No hay productos registrados"
          />
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', width: 320 }}>
          <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Select label="Categoría" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} options={CATEGORIA_OPTIONS} />
          <Input label="Costo" type="number" required value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} />
          <Input label="Precio" type="number" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
          <Input label="Stock" type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <Input label="Proveedor" value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} />
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </Modal>
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
  return <div style={{ fontSize: 26, fontWeight: 800, color: color ?? 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{children}</div>
}
