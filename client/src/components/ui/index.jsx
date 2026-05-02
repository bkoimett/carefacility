// Spinner
export function Spinner({ size = 'md' }) {
  const sz = { sm: 'loading-sm', md: 'loading-md', lg: 'loading-lg' }[size]
  return <span className={`loading loading-spinner ${sz} text-primary`} />
}

// Page header
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div className="flex-1">
        <h2 className="text-2xl font-display text-base-content">{title}</h2>
        {subtitle && <p className="text-sm text-base-content/60 mt-0.5 font-body">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// Empty state
export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display text-lg text-base-content/70 mb-1">{title}</h3>
      <p className="text-sm text-base-content/40 max-w-xs mb-4">{message}</p>
      {action}
    </div>
  )
}

// Error state
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="font-display text-lg text-error mb-1">Something went wrong</h3>
      <p className="text-sm text-base-content/50 max-w-xs mb-4">{message}</p>
      {onRetry && (
        <button className="btn btn-sm btn-outline" onClick={onRetry}>Try again</button>
      )}
    </div>
  )
}

// Stat card
export function StatCard({ label, value, sub, icon, colorClass = 'text-primary', trend, onClick }) {
  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer hover:bg-base-100 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-2xl font-display font-semibold ${colorClass}`}>{value}</p>
          {sub && <p className="text-xs text-base-content/40 mt-1">{sub}</p>}
        </div>
        {icon && (
          <span className="text-3xl opacity-70">{icon}</span>
        )}
      </div>
      {trend !== undefined && (
        <div className={`text-xs mt-2 font-mono ${trend >= 0 ? 'text-success' : 'text-error'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  )
}

// Modal wrapper
export function Modal({ id, title, children, size = 'max-w-lg', isOpen, onClose }) {
  return (
    <dialog id={id} className="modal" open={isOpen} onClose={onClose}>
      <div className={`modal-box ${size} font-body`}>
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">✕</button>
        </form>
        {title && <h3 className="font-display text-xl mb-4 pr-8">{title}</h3>}
        {children}
      </div>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  )
}

// Form field wrapper
export function FormField({ label, required, error, children, hint }) {
  return (
    <div className="form-control w-full">
      <label className="label py-1">
        <span className="label-text font-medium text-sm">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      {children}
      {hint && <label className="label py-0.5"><span className="label-text-alt text-base-content/40">{hint}</span></label>}
      {error && <label className="label py-0.5"><span className="label-text-alt text-error">{error}</span></label>}
    </div>
  )
}

// Balance display
export function BalanceDisplay({ balance, size = 'sm' }) {
  const textSize = size === 'lg' ? 'text-2xl' : 'text-sm'
  if (balance === null || balance === undefined) return <span className="text-base-content/30">—</span>

  if (balance > 0) return (
    <span className={`${textSize} font-mono font-semibold text-success`}>
      +KES {Math.abs(balance).toLocaleString()} <span className="text-xs opacity-70">(credit)</span>
    </span>
  )
  if (balance < 0) return (
    <span className={`${textSize} font-mono font-semibold text-error`}>
      −KES {Math.abs(balance).toLocaleString()} <span className="text-xs opacity-70">(owes)</span>
    </span>
  )
  return <span className={`${textSize} font-mono font-semibold text-success`}>Settled ✓</span>
}

// Confirm dialog hook helper
export function ConfirmDialog({ id, title, message, onConfirm, danger = true }) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box font-body max-w-sm">
        <h3 className="font-display text-lg mb-2">{title}</h3>
        <p className="text-sm text-base-content/60">{message}</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn btn-sm btn-ghost">Cancel</button>
            <button
              className={`btn btn-sm ${danger ? 'btn-error' : 'btn-primary'}`}
              onClick={onConfirm}
            >
              Confirm
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  )
}
