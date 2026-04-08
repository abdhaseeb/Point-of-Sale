import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { orderApi, productApi } from '../lib/api'
import { StatCard, SectionHeader, StatusBadge, Spinner } from '../components/ui'

export default function DashboardPage() {
  const { user } = useAuth()
  const { itemCount, total, fetchCart } = useCart()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
    async function load() {
      try {
        const [o, p] = await Promise.all([
          orderApi.getMyOrders(),
          productApi.getAll(),
        ])
        setOrders(o)
        setProducts(p)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const paidOrders = orders.filter(o => o.status === 'PAID').length
  const lowStock = products.filter(p => p.stock <= 5).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title={`Good day, ${user?.name ?? 'there'}`}
        subtitle={`You're logged in as ${user?.role}`}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Cart items" value={itemCount} sub="in current cart" accent />
        <StatCard label="Cart total" value={`₹${total.toFixed(2)}`} sub="before checkout" />
        <StatCard label="My orders" value={orders.length} sub={`${paidOrders} paid`} />
        <StatCard label="Pending orders" value={pendingOrders} sub="awaiting payment" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Recent orders</p>
            <button onClick={() => navigate('/orders')} className="text-accent text-xs hover:underline">
              View all
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="text-muted text-xs py-6 text-center">No orders yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs font-mono text-white">{order.id.slice(0, 8)}…</p>
                    <p className="text-muted text-[10px] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length ?? 0} items
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-xs font-mono">₹{Number(order.total).toFixed(2)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product stock overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Inventory snapshot</p>
            <button onClick={() => navigate('/products')} className="text-accent text-xs hover:underline">
              View all
            </button>
          </div>
          {products.length === 0 ? (
            <p className="text-muted text-xs py-6 text-center">No products yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {products.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <p className="text-xs text-white">{p.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-muted text-xs font-mono">₹{Number(p.price).toFixed(2)}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      p.stock <= 5
                        ? 'text-danger bg-danger/10 border-danger/20'
                        : 'text-success bg-success/10 border-success/20'
                    }`}>
                      {p.stock} left
                    </span>
                  </div>
                </div>
              ))}
              {lowStock > 0 && (
                <p className="text-warning text-[10px] pt-2">
                  ⚠ {lowStock} product{lowStock > 1 ? 's' : ''} low on stock
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 card p-5">
        <p className="text-sm font-semibold text-white mb-4">Quick actions</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/cart')} className="btn-primary">
            Go to cart
          </button>
          <button onClick={() => navigate('/products')} className="btn-secondary">
            Browse products
          </button>
          <button onClick={() => navigate('/orders')} className="btn-secondary">
            View my orders
          </button>
        </div>
      </div>
    </div>
  )
}
