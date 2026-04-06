import { useState } from 'react'
import { FormField } from '../ui'

const defaultForm = {
  amount: '',
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'mpesa',
  reference: '',
  paidBy: '',
  paymentType: 'monthly_fee',
  billingPeriodLabel: '',
  notes: '',
}

export default function PaymentForm({ clientName, onSubmit, loading }) {
  const [form, setForm] = useState(defaultForm)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, amount: Number(form.amount) })
    setForm(defaultForm)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {clientName && (
        <div className="alert alert-info py-2 text-sm">
          Recording payment for <strong>{clientName}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Amount (KES)" required hint="Use negative for credit/overpayment">
          <input
            type="number"
            className="input input-bordered input-sm w-full font-mono"
            value={form.amount}
            onChange={set('amount')}
            required
            placeholder="e.g. 60000 or -30000"
          />
        </FormField>

        <FormField label="Payment Date" required>
          <input
            type="date"
            className="input input-bordered input-sm w-full"
            value={form.paymentDate}
            onChange={set('paymentDate')}
            required
          />
        </FormField>

        <FormField label="Payment Method">
          <select className="select select-bordered select-sm w-full" value={form.paymentMethod} onChange={set('paymentMethod')}>
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <FormField label="Payment Type">
          <select className="select select-bordered select-sm w-full" value={form.paymentType} onChange={set('paymentType')}>
            <option value="monthly_fee">Monthly Fee</option>
            <option value="medical_fee">Medical Fee</option>
            <option value="deposit">Deposit</option>
            <option value="daily_charge">Daily Charge</option>
            <option value="credit_adjustment">Credit Adjustment</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <FormField label="Paid By">
          <input
            className="input input-bordered input-sm w-full"
            value={form.paidBy}
            onChange={set('paidBy')}
            placeholder="Sponsor name or 'self'"
          />
        </FormField>

        <FormField label="Reference / Receipt No.">
          <input
            className="input input-bordered input-sm w-full font-mono"
            value={form.reference}
            onChange={set('reference')}
            placeholder="e.g. QHJ7X2..."
          />
        </FormField>
      </div>

      <FormField label="Billing Period Label" hint="e.g. Month 2 · April 2025">
        <input
          className="input input-bordered input-sm w-full"
          value={form.billingPeriodLabel}
          onChange={set('billingPeriodLabel')}
          placeholder="Optional description of what this covers"
        />
      </FormField>

      <FormField label="Notes">
        <textarea
          className="textarea textarea-bordered w-full text-sm resize-none"
          rows={2}
          value={form.notes}
          onChange={set('notes')}
          placeholder="Any additional notes..."
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-1">
        <form method="dialog">
          <button className="btn btn-sm btn-ghost" type="submit">Cancel</button>
        </form>
        <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-xs" />}
          Record Payment
        </button>
      </div>
    </form>
  )
}
