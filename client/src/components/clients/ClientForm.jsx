import { useState, useEffect } from 'react'
import { sponsorsApi } from '../../utils/api'
import { FormField } from '../ui'

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

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Full Name" required>
          <input className="input input-bordered input-sm w-full" value={form.name} onChange={set('name')} required placeholder="e.g. John Doe" />
        </FormField>

        <FormField label="Gender" required>
          <select className="select select-bordered select-sm w-full" value={form.gender} onChange={set('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <FormField label="Date of Admission" required>
          <input type="date" className="input input-bordered input-sm w-full" value={form.dateOfAdmission} onChange={set('dateOfAdmission')} required />
        </FormField>

        <FormField label="Agreed Duration (months)" required>
          <input type="number" className="input input-bordered input-sm w-full font-mono" value={form.agreedDurationMonths}
            onChange={set('agreedDurationMonths')} min={1} required />
        </FormField>

        <FormField label="Monthly Fee (KES)" required>
          <input type="number" className="input input-bordered input-sm w-full font-mono" value={form.monthlyFee}
            onChange={set('monthlyFee')} min={0} required />
        </FormField>

        <FormField label="Medical Fee (KES)" required>
          <input type="number" className="input input-bordered input-sm w-full font-mono" value={form.medicalFee}
            onChange={set('medicalFee')} min={0} required />
        </FormField>

        <FormField label="Admission Deposit (KES)" hint="Recorded as first payment automatically">
          <input type="number" className="input input-bordered input-sm w-full font-mono" value={form.depositAmount}
            onChange={set('depositAmount')} min={0} placeholder="10000–20000" />
        </FormField>

        <FormField label="Deposit Paid By">
          <input className="input input-bordered input-sm w-full" value={form.depositPaidBy} onChange={set('depositPaidBy')} placeholder="Sponsor name or 'self'" />
        </FormField>

        <FormField label="Sponsor">
          <select className="select select-bordered select-sm w-full" value={form.sponsor} onChange={set('sponsor')}>
            <option value="">— None —</option>
            {sponsors.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.relationship})</option>
            ))}
          </select>
        </FormField>

        <FormField label="Status">
          <select className="select select-bordered select-sm w-full" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="discharged">Discharged</option>
            <option value="absconded">Absconded</option>
          </select>
        </FormField>

        <FormField label="Custom Daily Rate (KES)" hint="Overrides global 1,500 KES/day if set">
          <input type="number" className="input input-bordered input-sm w-full font-mono" value={form.customDailyRate}
            onChange={set('customDailyRate')} min={0} placeholder="Leave blank for default" />
        </FormField>
      </div>

      <FormField label="Comments / Directives" hint="Supports: IGNORE_ALERT:EXPIRY · MANUAL_BILLING:true · RESET_BILLING:monthly=X,medical=Y">
        <textarea className="textarea textarea-bordered w-full text-sm font-mono resize-none" rows={3}
          value={form.comments} onChange={set('comments')}
          placeholder="Optional notes or billing directives..." />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <form method="dialog"><button className="btn btn-sm btn-ghost" type="submit">Cancel</button></form>
        <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-xs" />}
          {initial ? 'Save Changes' : 'Add Client'}
        </button>
      </div>
    </form>
  )
}
