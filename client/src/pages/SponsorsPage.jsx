import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sponsorsApi } from '../utils/api'
import { useFetch, useAsync } from '../hooks/useFetch'
import { formatKES } from '../utils/formatters'
import { PageHeader, Spinner, EmptyState, ErrorState, Modal } from '../components/ui'
import SponsorForm from '../components/sponsors/SponsorForm'
import { TableSkeleton } from '../components/SkeletonLoader'
import { showError, showSuccess } from '../components/ToastNotifications'
import { Building2, Mail, Phone } from 'lucide-react'

const RELATIONSHIP_COLORS = {
  family: 'badge-primary',
  friend: 'badge-secondary',
  employer: 'badge-accent',
  ngo: 'badge-info',
  government: 'badge-success',
  self: 'badge-neutral',
  other: 'badge-ghost',
}

const RELATIONSHIP_LABELS = {
  family: 'Family',
  friend: 'Friend',
  employer: 'Employer',
  ngo: 'NGO / Charity',
  government: 'Government',
  self: 'Self',
  other: 'Other',
}

export default function SponsorsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [editTarget, setEditTarget] = useState(null)

  const { data, loading, error, refetch } = useFetch(
    () => sponsorsApi.getAll({ search }),
    [search]
  )
  const { run, loading: submitting } = useAsync()

  const sponsors = data || []

  const handleCreate = async (formData) => {
    try {
      await run(() => sponsorsApi.create(formData))
      document.getElementById('sponsor-modal')?.close()
      refetch()
      showSuccess('Sponsor added successfully')
    } catch (err) {
      showError(err.message || 'Failed to add sponsor')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      await run(() => sponsorsApi.update(editTarget._id, formData))
      document.getElementById('edit-sponsor-modal')?.close()
      setEditTarget(null)
      refetch()
      showSuccess('Sponsor updated successfully')
    } catch (err) {
      showError(err.message || 'Failed to update sponsor')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete sponsor "${name}"? Their clients will be unlinked.`)) return
    await run(() => sponsorsApi.delete(id))
    refetch()
  }

  const openEdit = (sponsor) => {
    setEditTarget(sponsor)
    setTimeout(() => document.getElementById('edit-sponsor-modal').showModal(), 50)
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />

  // Calculate totals
  const totalSponsors = sponsors.length
  const activeClients = sponsors.reduce((sum, s) => sum + (s.clientCount || 0), 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-[#F0F4FF] font-['DM_Serif_Display']">Sponsors</h1>
          <p className="text-[#3D4F6B] text-sm mt-1">{totalSponsors} sponsors managing {activeClients} active clients</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn-premium flex items-center gap-2"
            onClick={() => document.getElementById('sponsor-modal').showModal()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Sponsor
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="search"
          placeholder="Search by name or phone..."
          className="w-full bg-[#0B1426] border border-[#1A263D] rounded-[8px] px-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[rgba(6,182,212,0.1)] transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* SPONSORS GRID */}
      {loading ? (
        <TableSkeleton />
      ) : sponsors.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="No sponsors found"
          message="Add your first sponsor to start linking them to clients"
          action={
            <button
              className="btn-premium btn-sm"
              onClick={() => document.getElementById('sponsor-modal').showModal()}
            >
              Add Sponsor
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map(sponsor => (
            <div
              key={sponsor._id}
              className="card-premium p-5 hover:-translate-y-0.5 transition-transform duration-200 group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[rgba(6,182,212,0.08)] text-[#06B6D4] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[#F0F4FF] font-semibold text-sm">{sponsor.name}</h3>
                    <p className="text-[#3D4F6B] text-xs mt-0.5">
                      {RELATIONSHIP_LABELS[sponsor.relationship] || sponsor.relationship}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="w-7 h-7 rounded-[5px] border border-[#1A263D] text-[#6B7FA3] hover:text-[#06B6D4] hover:border-[#06B6D4] flex items-center justify-center transition-all"
                    onClick={() => openEdit(sponsor)}
                    title="Edit sponsor"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  <button
                    className="w-7 h-7 rounded-[5px] border border-[#1A263D] text-[#6B7FA3] hover:text-[#EF4444] hover:border-[#EF4444] flex items-center justify-center transition-all"
                    onClick={() => handleDelete(sponsor._id, sponsor.name)}
                    title="Delete sponsor"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1A263D] my-4"></div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[#3D4F6B] text-xs mb-1">Active Clients</p>
                  <p className="text-[#06B6D4] font-bold text-sm">{sponsor.clientCount || 0}</p>
                </div>
                <div>
                  <p className="text-[#3D4F6B] text-xs mb-1">Total Paid</p>
                  <p className="text-[#10B981] font-bold text-sm">{formatKES(sponsor.totalPaid || 0)}</p>
                </div>
              </div>

              {/* Contact info */}
              {(sponsor.phone || sponsor.email) && (
                <div className="mt-3 space-y-1.5 text-[#3D4F6B] text-xs">
                  {sponsor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{sponsor.email}</span>
                    </div>
                  )}
                  {sponsor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span className="font-mono">{sponsor.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom link */}
              {sponsor.clientCount > 0 && (
                <button
                  className="text-[#06B6D4] text-xs hover:underline mt-3 flex items-center gap-1"
                  onClick={() => navigate(`/clients?search=${encodeURIComponent(sponsor.name)}`)}
                >
                  View Clients →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal id="sponsor-modal" title="Add New Sponsor" size="max-w-lg">
        <SponsorForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <Modal id="edit-sponsor-modal" title="Edit Sponsor" size="max-w-lg">
        <SponsorForm
          initial={editTarget}
          onSubmit={handleUpdate}
          loading={submitting}
        />
      </Modal>
    </div>
  )
}
