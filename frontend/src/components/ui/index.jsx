// ── Spinner ───────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5'
  return (
    <div className={`${s} animate-spin rounded-full border-2 border-border border-t-accent`} />
  )
}

// ── Toast ─────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'border-success/30 text-success bg-success/5',
    error: 'border-danger/30 text-danger bg-danger/5',
    info: 'border-accent/30 text-accent bg-accent/5',
  }
  return (
    <div className={`fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-3 px-4 py-3 rounded-xl border card shadow-glow max-w-sm ${colors[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-muted hover:text-white text-lg leading-none">&times;</button>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-4 opacity-30">{icon}</div>
      <p className="text-white font-medium text-sm">{title}</p>
      {subtitle && <p className="text-muted text-xs mt-1">{subtitle}</p>}
    </div>
  )
}

// ── Status Badge ─────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    PENDING: 'badge-pending',
    PAID: 'badge-paid',
    FAILED: 'badge-failed',
  }
  return <span className={map[status] ?? 'badge-pending'}>{status}</span>
}

// ── Section Header ────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-lg leading-none">&times;</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`card p-4 ${accent ? 'border-accent/30 shadow-glow' : ''}`}>
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className={`text-2xl font-semibold font-mono ${accent ? 'text-accent' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-muted text-xs mt-1">{sub}</p>}
    </div>
  )
}
