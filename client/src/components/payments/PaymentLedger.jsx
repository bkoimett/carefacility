import { formatKES, formatDate } from '../../utils/formatters'

const METHOD_ICONS = {
  mpesa: '📱',
  cash: '💵',
  bank_transfer: '🏦',
  cheque: '📄',
  other: '💳',
}

export default function PaymentLedger({ payments = [], onDelete, runningBalance }) {
  if (payments.length === 0) {
    return (
      <div className="py-10 text-center text-base-content/30 text-sm">
        No payments recorded yet
      </div>
    )
  }

  // Build running balance from oldest to newest
  const sorted = [...payments].sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
  let cumulative = 0
  const withRunning = sorted.map(p => {
    cumulative += p.amount
    return { ...p, runningTotal: cumulative }
  })
  // Reverse for display (newest first)
  const displayed = [...withRunning].reverse()

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs w-full">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/40">
            <th className="font-semibold">Date</th>
            <th className="font-semibold">Description</th>
            <th className="font-semibold">Method</th>
            <th className="font-semibold">Paid By</th>
            <th className="font-semibold text-right">Amount</th>
            <th className="font-semibold text-right">Running Total</th>
            <th className="font-semibold">Ref</th>
            {onDelete && <th />}
          </tr>
        </thead>
        <tbody>
          {displayed.map(p => (
            <tr key={p._id} className="hover:bg-base-200 transition-colors group">
              <td className="font-mono text-xs text-base-content/60 whitespace-nowrap">
                {formatDate(p.paymentDate)}
              </td>
              <td>
                <div>
                  <span className="text-xs font-medium capitalize">
                    {p.paymentType?.replace(/_/g, ' ')}
                  </span>
                  {p.billingPeriodLabel && (
                    <span className="text-xs text-base-content/40 ml-1">· {p.billingPeriodLabel}</span>
                  )}
                  {p.notes && (
                    <p className="text-xs text-base-content/30 mt-0.5 truncate max-w-[180px]">{p.notes}</p>
                  )}
                </div>
              </td>
              <td className="text-center">
                <span title={p.paymentMethod}>
                  {METHOD_ICONS[p.paymentMethod] || '💳'}
                </span>
              </td>
              <td className="text-xs text-base-content/60">{p.paidBy || '—'}</td>
              <td className={`text-right font-mono font-semibold text-xs whitespace-nowrap
                ${p.amount < 0 ? 'text-warning' : p.amount > 0 ? 'text-success' : 'text-base-content/40'}
              `}>
                {p.amount < 0 ? '−' : '+'}{formatKES(Math.abs(p.amount))}
              </td>
              <td className={`text-right font-mono text-xs whitespace-nowrap
                ${p.runningTotal < 0 ? 'text-error/70' : 'text-success/70'}
              `}>
                {formatKES(p.runningTotal)}
              </td>
              <td className="font-mono text-xs text-base-content/30 max-w-[80px] truncate">
                {p.reference || '—'}
              </td>
              {onDelete && (
                <td>
                  <button
                    className="btn btn-xs btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDelete(p._id)}
                    title="Delete payment"
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-base-300 font-semibold">
            <td colSpan={4} className="text-xs text-base-content/50 pt-2">Total Paid</td>
            <td className="text-right font-mono text-sm text-success pt-2">
              {formatKES(payments.filter(p => p.amount > 0).reduce((s, p) => s + p.amount, 0))}
            </td>
            <td colSpan={onDelete ? 3 : 2} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
