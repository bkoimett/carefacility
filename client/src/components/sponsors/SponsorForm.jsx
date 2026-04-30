import { useState, useEffect } from 'react'
import { FormField } from '../ui'
import { validateSponsor } from '../../utils/validation'
import ValidationSummary from '../../components/ValidationSummary'
import { showError } from '../../components/ToastNotifications'

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

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form data
    const validation = validateSponsor(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      showError('Please fix the validation errors');
      return;
    }
    
    // Clear errors if validation passes
    setErrors({});
    
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ValidationSummary errors={errors} title="Please fix the following errors:" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Full Name" required>
          <input
            className="input input-bordered input-sm w-full"
            value={form.name}
            onChange={set('name')}
            required
            placeholder="e.g. Jane Doe"
          />
        </FormField>

        <FormField label="Phone Number">
          <input
            className="input input-bordered input-sm w-full font-mono"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+254 7XX XXX XXX"
          />
        </FormField>

        <FormField label="Email Address">
          <input
            type="email"
            className="input input-bordered input-sm w-full"
            value={form.email}
            onChange={set('email')}
            placeholder="jane@example.com"
          />
        </FormField>

        <FormField label="Relationship to Client">
          <select
            className="select select-bordered select-sm w-full"
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
        </FormField>
      </div>

      <FormField label="Address">
        <input
          className="input input-bordered input-sm w-full"
          value={form.address}
          onChange={set('address')}
          placeholder="Physical or postal address"
        />
      </FormField>

      <FormField label="Notes">
        <textarea
          className="textarea textarea-bordered w-full text-sm resize-none"
          rows={2}
          value={form.notes}
          onChange={set('notes')}
          placeholder="Any relevant notes about this sponsor..."
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-1">
        <form method="dialog">
          <button className="btn btn-sm btn-ghost" type="submit">Cancel</button>
        </form>
        <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-xs" />}
          {initial ? 'Save Changes' : 'Add Sponsor'}
        </button>
      </div>
    </form>
  )
}
