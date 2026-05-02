import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

const defaultForm = {
  name: '',
  phone: '',
  email: '',
  relationship: 'family',
  address: '',
  notes: '',
}

export default function SponsorForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || defaultForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) setForm({ ...defaultForm, ...initial })
  }, [initial])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleSubmit = () => {
    onSubmit(form)
  }

  return (
    <div className="space-y-5">
      {/* Main Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Full Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.name}
            onChange={set('name')}
            required
            placeholder="e.g. Jane Doe"
          />
          {errors.name && (
            <p className="text-[#EF4444] text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Phone Number
          </label>
          <input
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm font-mono text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+254 7XX XXX XXX"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
            value={form.email}
            onChange={set('email')}
            placeholder="jane@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
            Relationship to Client
          </label>
          <div className="relative">
            <select
              className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all appearance-none"
              value={form.relationship}
              onChange={set('relationship')}
            >
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="employer">Employer</option>
              <option value="ngo">NGO / Charity</option>
              <option value="government">Government</option>
              <option value="self">Self</option>
              <option value="other">Other</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D4F6B] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className="block text-[#6B7FA3] text-xs font-medium mb-1.5">
          Address
        </label>
        <input
          className="w-full bg-[#070D19] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
          value={form.address}
          onChange={set('address')}
          placeholder="Physical or postal address"
        />
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
          placeholder="Any relevant notes about this sponsor..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A263D] mt-2">
        <form method="dialog">
          <button type="submit" className="px-4 py-2.5 text-sm text-[#6B7FA3] hover:text-[#F0F4FF] rounded-[8px] hover:bg-[#1A263D] transition-all">
            Cancel
          </button>
        </form>
        <button
          type="button"
          className="btn-premium px-6 py-2.5 text-sm"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading && <span className="loading loading-spinner loading-xs mr-2" />}
          {initial ? 'Save Changes' : 'Add Sponsor'}
        </button>
      </div>
    </div>
  )
}
