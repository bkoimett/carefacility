import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sponsorsApi } from '../utils/api'
import { useFetch, useAsync } from '../hooks/useFetch'
import { PageHeader, Spinner, EmptyState, ErrorState, Modal } from '../components/ui'
import SponsorForm from '../components/sponsors/SponsorForm'
import { TableSkeleton } from '../components/SkeletonLoader'
import { showError, showSuccess } from '../components/ToastNotifications'

const RELATIONSHIP_COLORS = {
  family: 'badge-primary',
  friend: 'badge-secondary',
  employer: 'badge-accent',
  ngo: 'badge-info',
  government: 'badge-success',
  self: 'badge-neutral',
  other: 'badge-ghost',
}

const RELATIONSHIP_ICONS = {
  family: '👨‍👩‍👧',
  friend: '🤝',
  employer: '💼',
  ngo: '🏢',
  government: '🏛️',
  self: '👤',
  other: '❓',
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

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sponsors"
        subtitle={`${sponsors.length} registered sponsors`}
        actions={
          <button
            className="btn btn-primary btn-sm gap-1"
            onClick={() => document.getElementById('sponsor-modal').showModal()}
          >
            <span>+</span> Add Sponsor
          </button>
        }
      />

      {/* Search */}
      <input
        type="search"
        placeholder="Search by name or phone..."
        className="input input-bordered input-sm max-w-sm w-full"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

       {/* Grid */}
       {loading ? (
         <TableSkeleton />
       ) : sponsors.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="No sponsors found"
          message="Add your first sponsor to start linking them to clients"
          action={
            <button
              className="btn btn-primary btn-sm"
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
              className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                    {RELATIONSHIP_ICONS[sponsor.relationship] || '👤'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{sponsor.name}</h3>
                    <span className={`badge badge-xs capitalize mt-0.5 ${RELATIONSHIP_COLORS[sponsor.relationship] || 'badge-ghost'}`}>
                      {sponsor.relationship}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() => openEdit(sponsor)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => handleDelete(sponsor._id, sponsor.name)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-base-content/60">
                {sponsor.phone && (
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span className="font-mono">{sponsor.phone}</span>
                  </div>
                )}
                {sponsor.email && (
                  <div className="flex items-center gap-2 truncate">
                    <span>✉️</span>
                    <span className="truncate">{sponsor.email}</span>
                  </div>
                )}
                {sponsor.address && (
                  <div className="flex items-start gap-2">
                    <span>📍</span>
                    <span className="line-clamp-1">{sponsor.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-base-200 flex items-center justify-between">
                <span className="text-xs text-base-content/40">
                  {sponsor.clientCount ?? 0} client{sponsor.clientCount !== 1 ? 's' : ''}
                </span>
                {sponsor.clientCount > 0 && (
                  <button
                    className="btn btn-xs btn-ghost text-primary"
                    onClick={() => navigate(`/clients?search=${encodeURIComponent(sponsor.name)}`)}
                  >
                    View clients →
                  </button>
                )}
              </div>

              {sponsor.notes && (
                <p className="text-xs text-base-content/40 mt-2 line-clamp-2 italic">
                  {sponsor.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal id="sponsor-modal" title="Add New Sponsor">
        <SponsorForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      {/* Edit modal */}
      <Modal id="edit-sponsor-modal" title="Edit Sponsor">
        <SponsorForm
          initial={editTarget}
          onSubmit={handleUpdate}
          loading={submitting}
        />
      </Modal>
    </div>
  )
}
