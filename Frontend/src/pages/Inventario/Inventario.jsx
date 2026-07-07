import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
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

const EMPTY_FORM = { nombre: '', categoria: 'PROTEINA', costo: '', precio: '', stock: '', proveedor: '' }

export function Inventario() {
  const { showToast } = useToast()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h1 style={{ margin: 0 }}>Inventario</h1>
        <Button onClick={abrirNuevo}>Nuevo producto</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { key: 'nombre', header: 'Nombre' },
            { key: 'categoria', header: 'Categoría' },
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
          data={productos}
          emptyMessage="No hay productos registrados"
        />
      )}

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
