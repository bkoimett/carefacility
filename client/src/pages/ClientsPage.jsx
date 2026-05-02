import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsApi } from '../utils/api'
import { useFetch, useAsync } from '../hooks/useFetch'
import { formatKES, formatDate, getStatusColor, getPhaseLabel, daysUntilExpiry } from '../utils/formatters'
import { PageHeader, Spinner, EmptyState, ErrorState, Modal, BalanceDisplay } from '../components/ui'
import ClientForm from '../components/clients/ClientForm'
import { TableSkeleton } from '../components/SkeletonLoader'
import { showError, showSuccess } from '../components/ToastNotifications'
import { Search, Pencil, MoreHorizontal, Check } from 'lucide-react'

export default function ClientsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('active')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading, error, refetch } = useFetch(
    () => clientsApi.getClientsByStatus(statusFilter),
    [statusFilter]
  )
  const { run, loading: submitting } = useAsync()

  const clients = data?.clients || []
  const pagination = { total: clients.length }

  // Filter clients by search query
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.sponsor?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (formData) => {
    try {
      await run(() => clientsApi.create(formData))
      document.getElementById('client-modal')?.close()
      refetch()
      showSuccess('Client created successfully')
    } catch (err) {
      showError(err.message || 'Failed to create client')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This removes all payments and alerts.`)) return
    await run(() => clientsApi.delete(id))
    refetch()
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#F0F4FF]">Clients</h1>
          <p className="text-[#3D4F6B] text-sm mt-1">
            {data?.counts?.active ?? 0} active clients
          </p>
        </div>
        <button
          className="btn-premium flex items-center gap-2 w-full sm:w-auto"
          onClick={() => document.getElementById('client-modal').showModal()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D4F6B] w-4 h-4" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B1426] border border-[#1A263D] rounded-[8px] pl-9 pr-4 py-2.5 text-sm text-[#F0F4FF] placeholder:text-[#3D4F6B] focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[rgba(6,182,212,0.2)] transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-[#0B1426] border border-[#1A263D] rounded-[8px] p-1 flex-wrap">
          {[
            { key: 'active', label: 'Active', count: data?.counts?.active ?? 0 },
            { key: 'discharged', label: 'Discharged', count: data?.counts?.discharged ?? 0 },
            { key: 'all', label: 'All', count: data?.counts?.all ?? 0 }
          ].map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-1.5 text-sm rounded-[6px] transition-all duration-150 ${statusFilter === tab.key
                ? 'bg-[#1A263D] text-[#F0F4FF] font-medium'
                : 'text-[#6B7FA3]'}`}
              onClick={() => { setStatusFilter(tab.key); setPage(1) }}
            >
              {tab.label}
              <span className={`text-[8px] ml-1.5 rounded-full px-1.5 py-0.5 ${
                statusFilter === tab.key ? 'bg-[#06B6D4] text-white' : 'bg-[#1A263D] text-[#6B7FA3]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden sm:block card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A263D]">
                <th className="w-12 px-6 py-4 text-left">
                  <div className="w-4 h-4 rounded-[3px] border border-[#1A263D] bg-transparent"></div>
                </th>
                <th className="px-6 py-4 text-left text-[#3D4F6B] text-xs font-medium tracking-widest uppercase">Client</th>
                <th className="px-6 py-4 text-left text-[#3D4F6B] text-xs font-medium tracking-widest uppercase">Sponsor</th>
                <th className="px-6 py-4 text-left text-[#3D4F6B] text-xs font-medium tracking-widest uppercase">Admitted</th>
                <th className="px-6 py-4 text-left text-[#3D4F6B] text-xs font-medium tracking-widest uppercase">Fee Structure</th>
                <th className="px-6 py-4 text-left text-[#3D4F6B] text-xs font-medium tracking-widest uppercase">Balance</th>
                <th className="px-6 py-4 text-left text-[#3D4F6B] text-xs font-medium tracking-widest uppercase">Status</th>
                <th className="w-16 px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <TableSkeleton />
                  </td>
                </tr>
              ) : filteredClients.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon="👤"
                      title="No clients found"
                      message={searchQuery ? "No clients match your search" : "Add your first client to get started"}
                      action={
                        <button className="btn btn-primary btn-sm"
                          onClick={() => document.getElementById('client-modal').showModal()}>
                          Add Client
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => {
                  const daysLeft = daysUntilExpiry(client.dateOfAdmission, client.agreedDurationMonths)
                  const phaseInfo = getPhaseLabel(client.billing?.phase)
                  const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

                  return (
                    <tr
                      key={client._id}
                      className="border-b border-[#1A263D] last:border-0 hover:bg-[rgba(14,25,48,0.6)] transition-colors duration-150 group cursor-pointer"
                      onClick={() => navigate(`/clients/${client._id}`)}
                    >
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <div className="w-4 h-4 rounded-[3px] border border-[#1A263D] bg-transparent cursor-pointer"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A263D] to-[#070D19] ring-1 ring-[#1A263D] flex items-center justify-center text-[#06B6D4] text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-[#F0F4FF] text-sm font-medium">{client.name}</p>
                            {client.sponsor && (
                              <p className="text-[#3D4F6B] text-xs font-mono">via {client.sponsor.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6B7FA3] text-sm">
                        {client.sponsor?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-[#6B7FA3] text-sm font-mono">
                        {formatDate(client.dateOfAdmission)}
                      </td>
                      <td className="px-6 py-4 text-[#F0F4FF] text-sm font-mono">
                        <div>KES {formatKES(client.monthlyFee)}/mo</div>
                        <div className="text-[#6B7FA3] text-xs">+KES {formatKES(client.medicalFee)} med</div>
                      </td>
                      <td className="px-6 py-4">
                        <BalanceDisplay balance={client.billing?.balance} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-xs ${
                          phaseInfo.color.includes('text-success') ? 'badge-positive' :
                          phaseInfo.color.includes('text-error') ? 'badge-negative' :
                          phaseInfo.color.includes('text-warning') ? 'badge-warning' : 'badge-cyan'
                        }`}>
                          {phaseInfo.label}
                          {client.billing?.phase === 'post_expiry' && client.billing?.daysPostExpiry > 0 && (
                            <span className="ml-1 font-mono">+{client.billing.daysPostExpiry}d</span>
                          )}
                        </span>
                        <span className={`badge badge-xs ml-1 ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <button
                            className="w-7 h-7 rounded-[5px] text-[#3D4F6B] hover:text-[#06B6D4] hover:bg-[#1A263D] flex items-center justify-center transition-all"
                            onClick={() => navigate(`/clients/${client._id}`)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="w-7 h-7 rounded-[5px] text-[#3D4F6B] hover:text-[#EF4444] hover:bg-[#1A263D] flex items-center justify-center transition-all"
                            onClick={() => handleDelete(client._id, client.name)}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <TableSkeleton />
        ) : filteredClients.length === 0 && !loading ? (
          <EmptyState
            icon="👤"
            title="No clients found"
            message={searchQuery ? "No clients match your search" : "Add your first client to get started"}
            action={
              <button className="btn btn-primary btn-sm"
                onClick={() => document.getElementById('client-modal').showModal()}>
                Add Client
              </button>
            }
          />
        ) : (
          filteredClients.map(client => {
            const phaseInfo = getPhaseLabel(client.billing?.phase)
            const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            return (
              <div key={client._id} className="card-premium p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A263D] to-[#070D19] ring-1 ring-[#1A263D] flex items-center justify-center text-[#06B6D4] text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-[#F0F4FF] text-sm font-medium">{client.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <BalanceDisplay balance={client.billing?.balance} />
                    <span className={`badge badge-xs ${
                      phaseInfo.color.includes('text-success') ? 'badge-positive' :
                      phaseInfo.color.includes('text-error') ? 'badge-negative' :
                      phaseInfo.color.includes('text-warning') ? 'badge-warning' : 'badge-cyan'
                    }`}>
                      {phaseInfo.label}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#1A263D] grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[#3D4F6B] text-xs">Sponsor</p>
                    <p className="text-[#6B7FA3] text-sm">{client.sponsor?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[#3D4F6B] text-xs">Admitted</p>
                    <p className="text-[#6B7FA3] text-sm font-mono">{formatDate(client.dateOfAdmission)}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    className="text-[#06B6D4] bg-[rgba(6,182,212,0.08)] text-xs px-3 py-1.5 rounded-[6px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clients/${client._id}`);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-[#6B7FA3] bg-[#1A263D] text-xs px-3 py-1.5 rounded-[6px] hover:bg-[#1A263D]/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clients/${client._id}`);
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3 px-4 sm:px-6 py-4 border-t border-[#1A263D] mt-4">
          <span className="text-[#3D4F6B] text-xs hidden sm:block">
            Showing {filteredClients.length} of {pagination.total} clients
          </span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-[6px] border border-[#1A263D] text-[#6B7FA3] hover:border-[#06B6D4] hover:text-[#06B6D4] flex items-center justify-center transition-all" disabled>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-[6px] border border-[#06B6D4] bg-[#06B6D4] text-white flex items-center justify-center text-sm">
              1
            </button>
            <button className="w-8 h-8 rounded-[6px] border border-[#1A263D] text-[#6B7FA3] hover:border-[#06B6D4] hover:text-[#06B6D4] flex items-center justify-center transition-all" disabled>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      <Modal id="client-modal" title="Add New Client" size="max-w-2xl">
        <ClientForm onSubmit={handleCreate} loading={submitting} />
      </Modal>
    </div>
  )
}
