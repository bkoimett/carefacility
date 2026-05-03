import { useState } from 'react'
import { FormField } from '../ui'
import { AlertCircle } from 'lucide-react'

const PAYMENT_TYPES = [
  { value: 'monthly_fee', label: 'Monthly Fee' },
  { value: 'medical_fee', label: 'Medical Fee' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'daily_charge', label: 'Daily Charge' },
  { value: 'credit_adjustment', label: 'Adjustment (Credit)' },
  { value: 'other', label: 'Other' },
]

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
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Temporarily disable validation to debug payment blocking
    // const amount = Number(form.amount)
    // if (!amount) {
    //   setErrors({ amount: 'Amount is required' })
    //   return
    // }
    const payload = {
      amount: Number(form.amount) || 0,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod || 'cash',
      paymentType: form.paymentType || 'monthly_fee',
      reference: form.reference || '',
      paidBy: form.paidBy || '',
      billingPeriodLabel: form.billingPeriodLabel || '',
      notes: form.notes || '',
    }
    onSubmit(payload)
    setForm(defaultForm)
  }

  return (
    <div className="space-y-5">
      {/* Client info banner */}
      {clientName && (
        <div className="rounded-[8px] border border-[#1A263D] bg-[rgba(6,182,212,0.08)] px-4 py-3 text-sm text-[#06B6D4]">
          Recording payment for <strong>{clientName}</strong>
        </div>
      )}

      {/* Payment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Amount (KES) <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="number"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.amount}
            onChange={set('amount')}
            required
            placeholder="e.g. 60000 or -30000"
          />
          {errors.amount && (
            <p className="text-[#EF4444] text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.amount}
            </p>
          )}
          <p className="text-[#3D4F6B] text-xs">Use negative for credit/overpayment</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Payment Date <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="date"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.paymentDate}
            onChange={set('paymentDate')}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Payment Method
          </label>
          <div className="relative">
            <select
              className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all appearance-none"
              value={form.paymentMethod}
              onChange={set('paymentMethod')}
            >
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D4F6B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Payment Type <span className="text-[#EF4444]">*</span>
          </label>
          {/* Pill-style payment type selector */}
          <div className="flex flex-wrap gap-2">
            {PAYMENT_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                className={`px-3.5 py-2 text-xs rounded-full border transition-all ${
                  form.paymentType === type.value
                    ? 'border-[#06B6D4] text-[#06B6D4] bg-[rgba(6,182,212,0.08)]'
                    : 'border-[#1A263D] text-[#6B7FA3] hover:border-[#06B6D4] hover:text-[#06B6D4]'
                }`}
                onClick={() => setForm(f => ({ ...f, paymentType: type.value }))}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Paid By
          </label>
          <input
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.paidBy}
            onChange={set('paidBy')}
            placeholder="Sponsor name or 'self'"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Reference / Receipt No.
          </label>
          <input
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.reference}
            onChange={set('reference')}
            placeholder="e.g. QHJ7X2..."
          />
        </div>
      </div>

      {/* Billing Period Label */}
      <div className="space-y-1.5">
        <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
          Billing Period Label
        </label>
        <input
          className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
          value={form.billingPeriodLabel}
          onChange={set('billingPeriodLabel')}
          placeholder="e.g. Month 2 · April 2025"
        />
        <p className="text-[#3D4F6B] text-xs">Optional description of what this payment covers</p>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
          Notes
        </label>
        <textarea
          className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all min-h-[80px] resize-none"
          rows={2}
          value={form.notes}
          onChange={set('notes')}
          placeholder="Any additional notes..."
        />
      </div>

       {/* Form Actions */}
       <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A263D] mt-2">
         <button type="button" className="px-4 py-2.5 text-sm text-[#6B7FA3] hover:text-[#F0F4FF] rounded-[8px] hover:bg-[#1A263D] transition-all" onClick={() => {
           // Trigger dialog close via ESC or backdrop click - this is handled by the Modal
         }}>
           Cancel
         </button>
         <button
           type="button"
           className="btn-premium px-6 py-2.5 text-sm"
           disabled={loading}
           onClick={handleSubmit}
         >
           {loading && <span className="loading loading-spinner loading-xs mr-2" />}
           Record Payment
         </button>
       </div>
     </div>
  )
}
