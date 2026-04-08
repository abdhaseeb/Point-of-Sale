import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderApi } from '../lib/api'
import { SectionHeader, EmptyState, Spinner, Toast } from '../components/ui'
import { useToast } from '../hooks/useToast'

function generateIdempotencyKey() {
  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function CartItemRow({ item, onRemove, removing }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.product?.name ?? 'Product'}</p>
        <p className="text-muted text-xs mt-0.5 font-mono">
          ₹{Number(item.price).toFixed(2)} × {item.quantity}
        </p>
      </div>

      {/* Line total */}
      <p className="text-white font-mono text-sm font-medium shrink-0">
        ₹{(item.price * item.quantity).toFixed(2)}
      </p>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.productId)}
        disabled={removing === item.productId}
        className="text-muted hover:text-danger transition-colors p-1 shrink-0"
        title="Remove item"
      >
        {removing === item.productId ? <Spinner size="sm" /> : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default function CartPage() {
  const { cart, loading, fetchCart, removeItem, clearCart, total, itemCount } = useCart()
  const { toast, showToast, clearToast } = useToast()
  const navigate = useNavigate()
  const [removing, setRemoving] = useState(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [lastKey, setLastKey] = useState(null)

  useEffect(() => { fetchCart() }, [])

  async function handleRemove(productId) {
    setRemoving(productId)
    try {
      await removeItem(productId)
      showToast('Item removed', 'info')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setRemoving(null)
    }
  }

  async function handleClear() {
    setClearing(true)
    try {
      await clearCart()
      await fetchCart()
      showToast('Cart cleared', 'info')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setClearing(false)
    }
  }

  async function handleCheckout() {
    setCheckingOut(true)
    const key = generateIdempotencyKey()
    setLastKey(key)
    try {
      const order = await orderApi.checkout(key)
      await fetchCart()
      showToast('Order placed successfully!', 'success')
      setTimeout(() => navigate('/orders'), 1200)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setCheckingOut(false)
    }
  }

  const items = cart?.items ?? []

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Cart"
        subtitle={itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? 's' : ''} in cart` : 'Your cart is empty'}
        action={
          items.length > 0 && (
            <button onClick={handleClear} disabled={clearing} className="btn-danger flex items-center gap-2">
              {clearing && <Spinner size="sm" />}
              Clear cart
            </button>
          )
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center">
          <EmptyState icon="🛒" title="Cart is empty" subtitle="Add products from the Products page" />
          <button onClick={() => navigate('/products')} className="btn-primary mt-4">
            Browse products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 card p-5">
            <p className="text-xs text-muted mb-3 uppercase tracking-widest">Items</p>
            {items.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onRemove={handleRemove}
                removing={removing}
              />
            ))}
          </div>

          {/* Order summary */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <p className="text-xs text-muted mb-4 uppercase tracking-widest">Order summary</p>

              <div className="flex flex-col gap-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-muted truncate max-w-[140px]">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="text-white font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mb-5">
                <div className="flex justify-between">
                  <span className="text-sm text-white font-medium">Total</span>
                  <span className="text-accent font-mono text-lg font-semibold">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut || items.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {checkingOut ? (
                  <><Spinner size="sm" /> Processing…</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Checkout
                  </>
                )}
              </button>
            </div>

            {/* Idempotency key info */}
            <div className="card p-4 border-accent/20">
              <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Idempotency</p>
              <p className="text-muted text-xs leading-relaxed">
                Each checkout generates a unique key to prevent duplicate orders, even if the request is retried.
              </p>
              {lastKey && (
                <p className="text-[10px] font-mono text-accent/70 mt-2 break-all">{lastKey}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}
