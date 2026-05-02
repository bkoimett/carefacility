import { useState, useEffect } from 'react'
import { sponsorsApi } from '../../utils/api'
import { AlertCircle } from 'lucide-react'

const defaultForm = {
  name: '',
  gender: 'male',
  dateOfAdmission: new Date().toISOString().split('T')[0],
  agreedDurationMonths: 3,
  monthlyFee: 60000,
  medicalFee: 35000,
  depositAmount: 15000,
  depositPaidBy: '',
  sponsor: '',
  status: 'active',
  comments: '',
  customDailyRate: '',
}

export default function ClientForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || defaultForm)
  const [sponsors, setSponsors] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    sponsorsApi.getAll().then(r => setSponsors(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (initial) setForm({ ...defaultForm, ...initial,
      dateOfAdmission: initial.dateOfAdmission ? initial.dateOfAdmission.split('T')[0] : defaultForm.dateOfAdmission,
      sponsor: initial.sponsor?._id || initial.sponsor || '',
      customDailyRate: initial.customDailyRate || '',
    })
  }, [initial])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...form }
    if (!data.customDailyRate) delete data.customDailyRate
    if (!data.sponsor) delete data.sponsor
    data.agreedDurationMonths = Number(data.agreedDurationMonths) || 3
    data.monthlyFee = Number(data.monthlyFee) || 0
    data.medicalFee = Number(data.medicalFee) || 0
    data.depositAmount = Number(data.depositAmount) || 0
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Personal Information Section */}
      <p className="text-[#3D4F6B] text-xs tracking-widest uppercase font-medium mb-3 pb-2 border-b border-[#1A263D]">
        Personal Information
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Full Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.name ?? ''}
            onChange={set('name')}
            required
            placeholder="e.g. John Doe"
          />
          {errors.name && (
            <p className="text-[#EF4444] text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Gender <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <select
              className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all appearance-none"
              value={form.gender ?? ''}
              onChange={set('gender')}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D4F6B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Date of Admission <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="date"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.dateOfAdmission ?? ''}
            onChange={set('dateOfAdmission')}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Agreed Duration (months) <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="number"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.agreedDurationMonths ?? ''}
            onChange={set('agreedDurationMonths')}
            min={1}
            required
          />
        </div>
      </div>

      {/* Fee Structure Section */}
      <p className="text-[#3D4F6B] text-xs tracking-widest uppercase font-medium mb-3 pb-2 border-b border-[#1A263D]">
        Fee Structure
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Monthly Fee (KES) <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="number"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.monthlyFee ?? ''}
            onChange={set('monthlyFee')}
            min={0}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Medical Fee (KES) <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="number"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.medicalFee ?? ''}
            onChange={set('medicalFee')}
            min={0}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Admission Deposit (KES)
          </label>
          <input
            type="number"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.depositAmount ?? ''}
            onChange={set('depositAmount')}
            min={0}
            placeholder="10000–20000"
          />
          <p className="text-[#3D4F6B] text-xs mt-1">Recorded as first payment automatically</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Deposit Paid By
          </label>
          <input
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.depositPaidBy ?? ''}
            onChange={set('depositPaidBy')}
            placeholder="Sponsor name or 'self'"
          />
        </div>
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Sponsor
          </label>
          <div className="relative">
            <select
              className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all appearance-none"
              value={form.sponsor ?? ''}
              onChange={set('sponsor')}
            >
              <option value="">— None —</option>
              {sponsors.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.relationship})</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D4F6B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Status
          </label>
          <div className="relative">
            <select
              className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all appearance-none"
              value={form.status ?? ''}
              onChange={set('status')}
            >
              <option value="active">Active</option>
              <option value="discharged">Discharged</option>
              <option value="absconded">Absconded</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D4F6B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Custom Daily Rate (KES)
          </label>
          <input
            type="number"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.customDailyRate ?? ''}
            onChange={set('customDailyRate')}
            min={0}
            placeholder="Leave blank for default (1,500)"
          />
          <p className="text-[#3D4F6B] text-xs mt-1">Overrides global daily rate if set</p>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-1.5">
        <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
          Comments / Directives
        </label>
        <textarea
          className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all min-h-[80px] resize-none"
          rows={3}
            value={form.comments ?? ''}
          onChange={set('comments')}
          placeholder="Optional notes or billing directives..."
        />
        <p className="text-[#3D4F6B] text-xs">
          Supports: IGNORE_ALERT:EXPIRY · MANUAL_BILLING:true · RESET_BILLING:monthly=X,medical=Y
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A263D] mt-2">
        <form method="dialog">
          <button type="submit" className="px-4 py-2.5 text-sm text-[#6B7FA3] hover:text-[#F0F4FF] rounded-[8px] hover:bg-[#1A263D] transition-all">
            Cancel
          </button>
        </form>
        <button
          type="submit"
          className="btn-premium px-6 py-2.5 text-sm"
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner loading-xs mr-2" />}
          {initial ? 'Save Changes' : 'Add Client'}
        </button>
      </div>
    </form>
  )
}
