import { useEffect, useState } from 'react'
import { productApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { SectionHeader, Modal, EmptyState, Spinner, Toast } from '../components/ui'
import { useToast } from '../hooks/useToast'

function ProductCard({ product, onAddToCart, onDelete, isAdmin }) {
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    setAdding(true)
    await onAddToCart(product.id, qty)
    setAdding(false)
    setQty(1)
  }

  const outOfStock = product.stock === 0

  return (
    <div className="card p-4 flex flex-col gap-3 hover:border-accent/30 transition-colors duration-150">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{product.name}</p>
          <p className="text-accent font-mono text-base font-semibold mt-0.5">
            ₹{Number(product.price).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            outOfStock
              ? 'text-danger bg-danger/10 border-danger/20'
              : product.stock <= 5
              ? 'text-warning bg-warning/10 border-warning/20'
              : 'text-success bg-success/10 border-success/20'
          }`}>
            {outOfStock ? 'Out of stock' : `${product.stock} left`}
          </span>
          {isAdmin && (
            <button
              onClick={() => onDelete(product)}
              className="p-1 text-muted hover:text-danger transition-colors rounded"
              title="Delete product"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Add to cart controls */}
      {!outOfStock && (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="px-2.5 py-1.5 text-muted hover:text-white hover:bg-surface-3 transition-colors text-sm"
            >
              −
            </button>
            <span className="px-3 text-white text-xs font-mono min-w-[32px] text-center">{qty}</span>
            <button
              onClick={() => setQty(q => Math.min(product.stock, q + 1))}
              className="px-2.5 py-1.5 text-muted hover:text-white hover:bg-surface-3 transition-colors text-sm"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5"
          >
            {adding ? <Spinner size="sm" /> : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
            {adding ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      )}
    </div>
  )
}

function CreateProductModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', price: '', stock: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await productApi.create({
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      })
      setForm({ name: '', price: '', stock: '' })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add new product">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-muted mb-1.5 block">Product name</label>
          <input className="input" placeholder="e.g. Espresso" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted mb-1.5 block">Price (₹)</label>
            <input className="input" type="number" step="0.01" min="0" placeholder="0.00" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Stock qty</label>
            <input className="input" type="number" min="0" placeholder="100" value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
          </div>
        </div>
        {error && (
          <p className="text-danger text-xs bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Spinner size="sm" />}
            {loading ? 'Creating…' : 'Create product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function DeleteConfirmModal({ product, onClose, onConfirm, loading }) {
  if (!product) return null
  return (
    <Modal open={!!product} onClose={onClose} title="Delete product">
      <div className="flex flex-col gap-4">
        <div className="bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
          <p className="text-danger text-xs font-medium mb-1">This action cannot be undone.</p>
          <p className="text-muted text-xs">
            Deleting <span className="text-white font-medium">"{product.name}"</span> will
            permanently remove it from inventory. Products that appear in existing orders
            cannot be deleted.
          </p>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger flex items-center gap-2">
            {loading && <Spinner size="sm" />}
            {loading ? 'Deleting…' : 'Delete product'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function ProductsPage() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const { toast, showToast, clearToast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = user?.role === 'admin'

  async function load() {
    setLoading(true)
    try {
      const data = await productApi.getAll()
      setProducts(data)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAddToCart(productId, quantity) {
    try {
      await addItem(productId, quantity)
      showToast('Added to cart', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productApi.delete(deleteTarget.id)
      showToast(`"${deleteTarget.name}" deleted`, 'info')
      setDeleteTarget(null)
      await load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Products"
        subtitle={`${products.length} products in inventory`}
        action={
          isAdmin && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add product
            </button>
          )
        }
      />

      {/* Search */}
      <div className="mb-6">
        <input
          className="input max-w-xs"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No products found" subtitle={search ? 'Try a different search' : 'Add products to get started'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={handleAddToCart}
              onDelete={setDeleteTarget}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <CreateProductModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />

      <DeleteConfirmModal
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}

/*function CreateProductModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', price: '', stock: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await productApi.create({
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      })
      setForm({ name: '', price: '', stock: '' })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add new product">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-muted mb-1.5 block">Product name</label>
          <input className="input" placeholder="e.g. Espresso" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted mb-1.5 block">Price (₹)</label>
            <input className="input" type="number" step="0.01" min="0" placeholder="0.00" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Stock qty</label>
            <input className="input" type="number" min="0" placeholder="100" value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
          </div>
        </div>
        {error && (
          <p className="text-danger text-xs bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Spinner size="sm" />}
            {loading ? 'Creating…' : 'Create product'}
          </button>
        </div>
      </form>
    </Modal>
  )
} */

/*
export default function ProductsPage() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const { toast, showToast, clearToast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const isAdmin = user?.role === 'admin'

  async function load() {
    setLoading(true)
    try {
      const data = await productApi.getAll()
      setProducts(data)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAddToCart(productId, quantity) {
    try {
      await addItem(productId, quantity)
      showToast('Added to cart', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Products"
        subtitle={`${products.length} products in inventory`}
        action={
          isAdmin && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add product
            </button>
          )
        }
      />

      {/* Search}
      <div className="mb-6">
        <input
          className="input max-w-xs"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No products found" subtitle={search ? 'Try a different search' : 'Add products to get started'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={handleAddToCart}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <CreateProductModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}
*/
