import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsApi } from '../utils/api'
import { useFetch, useAsync } from '../hooks/useFetch'
import { formatKES, formatDate, getStatusColor, getPhaseLabel, daysUntilExpiry } from '../utils/formatters'
import { PageHeader, Spinner, EmptyState, ErrorState, Modal, BalanceDisplay } from '../components/ui'
import ClientForm from '../components/clients/ClientForm'
import { TableSkeleton } from '../components/SkeletonLoader'
import { validateClient } from '../utils/validation'
import ValidationSummary from '../components/ValidationSummary'
import { showError, showSuccess } from '../components/ToastNotifications'

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const params = { search, status: statusFilter, page, limit: 20 }
  const { data, loading, error, refetch } = useFetch(
    () => clientsApi.getAll(params),
    [search, statusFilter, page]
  )
  const { run, loading: submitting } = useAsync()

  const clients = data?.data || data || []
  const pagination = data?.pagination

   const handleCreate = async (formData) => {
     // Frontend validation
     const validation = validateClient(formData);
     if (!validation.isValid) {
       showValidationErrors(validation.errors);
       return;
     }
     
     await run(() => clientsApi.create(formData));
     document.getElementById('client-modal').close();
     refetch();
     showSuccess('Client created successfully');
   }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This removes all payments and alerts.`)) return
    await run(() => clientsApi.delete(id))
    refetch()
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />

   if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        subtitle={`${pagination?.total ?? 0} total clients`}
        actions={
          <button className="btn btn-primary btn-sm gap-1" onClick={() => document.getElementById('client-modal').showModal()}>
            <span>+</span> Add Client
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search by name..."
          className="input input-bordered input-sm flex-1 max-w-xs"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <div className="tabs tabs-boxed bg-base-200 self-start">
          {['all', 'active', 'discharged', 'absconded'].map(s => (
            <button
              key={s}
              className={`tab tab-sm capitalize ${statusFilter === s ? 'tab-active' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(1) }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-base-200 text-xs uppercase tracking-wider text-base-content/50">
                <th className="font-semibold">Client</th>
                <th className="font-semibold">Admission</th>
                <th className="font-semibold">Duration</th>
                <th className="font-semibold">Fees</th>
                <th className="font-semibold">Balance</th>
                <th className="font-semibold">Phase</th>
                <th className="font-semibold">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="text-center py-12"><Spinner /></td></tr>
              )}
              {!loading && clients.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon="👤"
                      title="No clients found"
                      message={search ? 'Try a different search term' : 'Add your first client to get started'}
                      action={
                        !search && (
                          <button className="btn btn-primary btn-sm"
                            onClick={() => document.getElementById('client-modal').showModal()}>
                            Add Client
                          </button>
                        )
                      }
                    />
                  </td>
                </tr>
              )}
              {clients.map(client => {
                const daysLeft = daysUntilExpiry(client.dateOfAdmission, client.agreedDurationMonths)
                const phaseInfo = getPhaseLabel(client.billing?.phase)
                return (
                  <tr
                    key={client._id}
                    className="table-row-hover"
                    onClick={() => navigate(`/clients/${client._id}`)}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                          ${client.status === 'active' ? 'bg-primary/10 text-primary' :
                            client.status === 'discharged' ? 'bg-base-300 text-base-content/50' :
                            'bg-warning/10 text-warning'}
                        `}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{client.name}</p>
                          {client.sponsor && (
                            <p className="text-xs text-base-content/40">via {client.sponsor.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-xs font-mono text-base-content/60">{formatDate(client.dateOfAdmission)}</td>
                    <td className="text-xs font-mono">
                      {client.agreedDurationMonths}mo
                      {client.billing?.phase !== 'post_expiry' && daysLeft > 0 && (
                        <span className="text-base-content/40 ml-1">({daysLeft}d left)</span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs font-mono">
                        <div className="text-base-content/70">{formatKES(client.monthlyFee)}/mo</div>
                        <div className="text-base-content/40">+{formatKES(client.medicalFee)} med</div>
                      </div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <BalanceDisplay balance={client.billing?.balance} />
                    </td>
                    <td>
                      <span className={`badge badge-xs ${phaseInfo.color}`}>
                        {phaseInfo.label}
                        {client.billing?.phase === 'post_expiry' && client.billing?.daysPostExpiry > 0 && (
                          <span className="ml-1 font-mono">+{client.billing.daysPostExpiry}d</span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-xs capitalize ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-xs btn-ghost text-error opacity-0 group-hover:opacity-100"
                        onClick={() => handleDelete(client._id, client.name)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-base-300">
            <span className="text-xs text-base-content/40 font-mono">
              Page {pagination.page} of {pagination.pages} · {pagination.total} clients
            </span>
            <div className="join">
              <button className="join-item btn btn-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>«</button>
              <button className="join-item btn btn-xs btn-disabled">{page}</button>
              <button className="join-item btn btn-xs" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* Add client modal */}
      <Modal id="client-modal" title="Add New Client" size="max-w-2xl">
        <ClientForm onSubmit={handleCreate} loading={submitting} />
      </Modal>
    </div>
  )
}
