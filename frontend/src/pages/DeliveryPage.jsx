import { useEffect, useState } from 'react'
import { orderApi } from '../lib/api'
import { SectionHeader, EmptyState, Spinner, Toast, StatusBadge } from '../components/ui'
import { useToast } from '../hooks/useToast'

// Maps each delivery status to a human-readable label for the advance button.
// This is a pure UI decision — the actual status string is owned by the backend.
const ADVANCE_LABELS = {
    "PENDING":          "Confirm order",
    "CONFIRMED":        "Mark dispatched",
    "OUT_FOR_DELIVERY": "Mark delivered",
}

function DeliveryOrderRow({ order, onAdvance, advancing }) {
    const [expanded, setExpanded] = useState(false)
    const canAdvance = order.status !== "DELIVERED" && order.status !== "PAID"
    const buttonLabel = ADVANCE_LABELS[order.status]

    return (
        <div className="card overflow-hidden">
            <div
                className="flex items-start gap-4 p-4 cursor-pointer hover:bg-surface-2 transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex-1 min-w-0">
                    {/* Customer info */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-white text-sm font-medium">{order.user?.name}</p>
                        <StatusBadge status={order.status} />
                    </div>
                    <p className="text-muted text-xs font-mono">{order.id.slice(0, 12)}…</p>
                    {/* Delivery address shown inline so admin can see it at a glance */}
                    {order.deliveryAddress && (
                        <p className="text-muted text-xs mt-1 flex items-start gap-1">
                            <svg className="w-3 h-3 mt-0.5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {order.deliveryAddress}
                        </p>
                    )}
                    <p className="text-muted text-[10px] mt-1">
                        {new Date(order.createdAt).toLocaleString()} ·
                        Payment: <span className="text-white">{order.paymentMethod?.replace(/_/g, ' ')}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-accent font-mono font-semibold text-sm">
                        ₹{Number(order.total).toFixed(2)}
                    </span>
                    {canAdvance && (
                        <button
                            onClick={e => { e.stopPropagation(); onAdvance(order.id) }}
                            disabled={advancing === order.id}
                            className="btn-primary text-xs py-1.5 flex items-center gap-1.5"
                        >
                            {advancing === order.id ? <Spinner size="sm" /> : null}
                            {advancing === order.id ? 'Updating…' : buttonLabel}
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

            {/* Expanded: show line items and customer contact */}
            {expanded && (
                <div className="border-t border-border px-4 py-3 bg-surface-2 animate-fade-in">
                    {order.user?.phone && (
                        <p className="text-xs text-muted mb-3">
                            Phone: <span className="text-white">{order.user.phone}</span>
                        </p>
                    )}
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Items</p>
                    <div className="flex flex-col gap-1.5 mb-3">
                        {order.items?.map(item => (
                            <div key={item.id} className="flex justify-between text-xs">
                                <span className="text-muted">{item.product?.name} × {item.quantity}</span>
                                <span className="font-mono text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs border-t border-border pt-2">
                        <span className="text-muted font-medium">Total</span>
                        <span className="font-mono text-accent font-semibold">₹{Number(order.total).toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function DeliveryPage() {
    const { toast, showToast, clearToast } = useToast()
    const [orders,   setOrders]   = useState([])
    const [loading,  setLoading]  = useState(true)
    const [advancing, setAdvancing] = useState(null)

    async function load() {
        setLoading(true)
        try {
            const data = await orderApi.getDeliveries()
            setOrders(data)
        } catch (e) {
            showToast(e.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    async function handleAdvance(orderId) {
        setAdvancing(orderId)
        try {
            await orderApi.advance(orderId)
            showToast('Order status updated', 'success')
            await load()
        } catch (e) {
            showToast(e.message, 'error')
        } finally {
            setAdvancing(null)
        }
    }

    // Count orders in each status for the summary bar
    const counts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1
        return acc
    }, {})

    return (
        <div className="animate-fade-in">
            <SectionHeader
                title="Delivery orders"
                subtitle={`${orders.length} remote order${orders.length !== 1 ? 's' : ''}`}
            />

            {orders.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"].map(s => (
                        <div key={s} className="card p-3 text-center">
                            <p className="text-white font-mono text-lg font-semibold">{counts[s] || 0}</p>
                            <p className="text-muted text-[10px] mt-0.5">{s.replace(/_/g, ' ')}</p>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : orders.length === 0 ? (
                <EmptyState icon="🛵" title="No delivery orders" subtitle="Remote orders placed by customers will appear here" />
            ) : (
                <div className="flex flex-col gap-3">
                    {orders.map(order => (
                        <DeliveryOrderRow
                            key={order.id}
                            order={order}
                            onAdvance={handleAdvance}
                            advancing={advancing}
                        />
                    ))}
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
        </div>
    )
}
