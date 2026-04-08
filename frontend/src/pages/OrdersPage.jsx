import { useEffect, useState } from 'react'
import { orderApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { SectionHeader, EmptyState, StatusBadge, Spinner, Toast, Modal } from '../components/ui'
import { useToast } from '../hooks/useToast'

function generatePaymentKey(orderId) {
  return `pay-${orderId}-${Date.now()}`
}

function OrderRow({ order, onPay, paying }) {
  const [expanded, setExpanded] = useState(false)
  const isPending = order.status === 'PENDING'

  return (
    <div className="card overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-2 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white text-xs font-mono">{order.id.slice(0, 12)}…</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted text-[10px] mt-1">
            {new Date(order.createdAt).toLocaleString()} · {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-accent font-mono font-semibold text-sm">₹{Number(order.total).toFixed(2)}</span>
          {isPending && (
            <button
              onClick={e => { e.stopPropagation(); onPay(order.id) }}
              disabled={paying === order.id}
              className="btn-success flex items-center gap-1.5 text-xs py-1.5"
            >
              {paying === order.id ? <Spinner size="sm" /> : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              )}
              {paying === order.id ? 'Processing…' : 'Pay now'}
            </button>
          )}
          <svg
            className={`w-4 h-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && order.items?.length > 0 && (
        <div className="border-t border-border px-4 py-3 bg-surface-2 animate-fade-in">
          <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Line items</p>
          <div className="flex flex-col gap-1.5">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-muted">
                  {item.product?.name ?? 'Product'} × {item.quantity}
                </span>
                <span className="font-mono text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-2 flex justify-between text-xs">
            <span className="text-muted font-medium">Order total</span>
            <span className="font-mono text-accent font-semibold">₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { toast, showToast, clearToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)
  const [tab, setTab] = useState('mine') // 'mine' | 'all'

  const isAdmin = user?.role === 'admin'

  async function load() {
    setLoading(true)
    try {
      if (tab === 'all' && isAdmin) {
        const data = await orderApi.getAll()
        setOrders(data)
      } else {
        const data = await orderApi.getMyOrders()
        setOrders(data)
      }
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tab])

  async function handlePay(orderId) {
    setPaying(orderId)
    const key = generatePaymentKey(orderId)
    try {
      await orderApi.pay(orderId, key)
      showToast('Payment successful!', 'success')
      await load()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setPaying(null)
    }
  }

  const pending = orders.filter(o => o.status === 'PENDING')
  const paid = orders.filter(o => o.status === 'PAID')
  const failed = orders.filter(o => o.status === 'FAILED')

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''} · ${pending.length} pending`}
        action={
          isAdmin && (
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                onClick={() => setTab('mine')}
                className={`px-3 py-1.5 text-xs transition-colors ${tab === 'mine' ? 'bg-surface-3 text-white' : 'text-muted hover:text-white'}`}
              >
                My orders
              </button>
              <button
                onClick={() => setTab('all')}
                className={`px-3 py-1.5 text-xs transition-colors ${tab === 'all' ? 'bg-surface-3 text-white' : 'text-muted hover:text-white'}`}
              >
                All orders
              </button>
            </div>
          )
        }
      />

      {/* Summary bar */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-3 text-center">
            <p className="text-warning font-mono text-lg font-semibold">{pending.length}</p>
            <p className="text-muted text-[10px] mt-0.5">Pending</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-success font-mono text-lg font-semibold">{paid.length}</p>
            <p className="text-muted text-[10px] mt-0.5">Paid</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-danger font-mono text-lg font-semibold">{failed.length}</p>
            <p className="text-muted text-[10px] mt-0.5">Failed</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon="🧾" title="No orders yet" subtitle="Place your first order from the cart" />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              onPay={handlePay}
              paying={paying}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  )
}
