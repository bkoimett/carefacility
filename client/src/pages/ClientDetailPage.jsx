import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsApi, paymentsApi, alertsApi } from '../utils/api'
import { useFetch, useAsync } from '../hooks/useFetch'
import {
  formatKES, formatDate, getStatusColor, getPhaseLabel,
  getAlertTypeIcon, timeAgo, daysUntilExpiry
} from '../utils/formatters'
import {
  Spinner, ErrorState, Modal, BalanceDisplay, ConfirmDialog
} from '../components/ui'
import ClientForm from '../components/clients/ClientForm'
import PaymentForm from '../components/payments/PaymentForm'
import PaymentLedger from '../components/payments/PaymentLedger'
import BillingBreakdown from '../components/payments/BillingBreakdown'
import { DetailSkeleton } from '../components/SkeletonLoader'
import { validateClient, validatePayment } from '../utils/validation'
import ValidationSummary from '../components/ValidationSummary'
import { showError, showSuccess, showValidationErrors } from '../components/ToastNotifications'
import { ChevronLeft, Pencil, LogOut, Trash2, CreditCard } from 'lucide-react'

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Payments')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, loading, error, refetch } = useFetch(
    () => clientsApi.getById(id),
    [id]
  )
  const { run, loading: submitting } = useAsync()

  const client = data
  const billing = client?.billing
  const payments = client?.payments || []
  const alerts = client?.alerts || []

  const handleUpdateClient = async (formData) => {
    // Frontend validation
    const validation = validateClient(formData);
    if (!validation.isValid) {
      showValidationErrors(validation.errors);
      return;
    }
    
    await run(() => clientsApi.update(id, formData))
    document.getElementById('edit-client-modal').close()
    refetch()
    showSuccess('Client updated successfully')
  }

  const handleAddPayment = async (formData) => {
    // Temporarily disable validation to debug payment blocking
    // const validation = validatePayment(formData);
    // if (!validation.isValid) {
    //   showValidationErrors(validation.errors);
    //   return;
    // }
    
    try {
      await run(() => paymentsApi.create({ ...formData, clientId: id }))
      document.getElementById('payment-modal').close()
      refetch()
      showSuccess('Payment recorded successfully')
    } catch (err) {
      console.error('Payment creation failed:', err)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('Delete this payment entry?')) return
    await run(() => paymentsApi.delete(paymentId))
    refetch()
  }

  const handleDismissAlert = async (alertId) => {
    await run(() => alertsApi.dismiss(alertId))
    refetch()
  }

  const handleDischarge = async () => {
    await run(() => clientsApi.discharge(id))
    document.getElementById('discharge-confirm').close()
    refetch()
    showSuccess('Client discharged successfully')
  }

  const handleDelete = async () => {
    await run(() => clientsApi.delete(id))
    document.getElementById('delete-confirm').close()
    navigate('/clients')
    showSuccess('Client permanently deleted')
  }

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!client) return <ErrorState message="Client not found" />

  const phaseInfo = getPhaseLabel(billing?.phase)
  const daysLeft = daysUntilExpiry(client.dateOfAdmission, client.agreedDurationMonths)
  const unreadAlerts = alerts.filter(a => !a.isRead && !a.isDismissed)
  const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Financial summary calculations
  const monthlyFee = client.monthlyFee
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const outstandingBalance = billing?.balance || 0
  const daysAdmitted = Math.max(0, Math.floor((new Date() - new Date(client.dateOfAdmission)) / (1000 * 60 * 60 * 24)))

  // Get payment type badge class
  const getPaymentTypeBadge = (type) => {
    switch (type) {
      case 'monthly_fee': return 'badge-cyan'
      case 'medical_fee': return 'badge-warning'
      case 'deposit': return 'badge-positive'
      default: return ''
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-4 sm:p-6 lg:p-8 pb-0">
        {/* Back button */}
        <button
          className="flex items-center gap-2 text-[#3D4F6B] hover:text-[#06B6D4] text-sm mb-4 transition-colors"
          onClick={() => navigate('/clients')}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Clients
        </button>

        {/* Client Hero Card */}
        <div className="card-premium p-6 mb-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A263D] to-[#070D19] ring-2 ring-[#1A263D] flex items-center justify-center text-[#06B6D4] text-2xl font-bold font-['DM_Serif_Display'] flex-shrink-0">
              {initials}
            </div>

            {/* Center: Client Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-[#F0F4FF]">{client.name}</h1>
              <p className="text-[#6B7FA3] text-sm mt-1">
                {client.sponsor?.name || 'No sponsor'} · Admitted {formatDate(client.dateOfAdmission)}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`badge capitalize ${getStatusColor(client.status)}`}>{client.status}</span>
                <span className={`badge ${phaseInfo.color}`}>
                  {phaseInfo.label}
                  {billing?.phase === 'post_expiry' && billing?.daysPostExpiry > 0 && ` · +${billing.daysPostExpiry}d`}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#1A263D]"></span>
                <span className="text-[#3D4F6B] text-xs font-mono">ID: {client._id?.slice(-6)}</span>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="w-9 h-9 rounded-[8px] border border-[#1A263D] text-[#6B7FA3] hover:text-[#06B6D4] hover:border-[#06B6D4] flex items-center justify-center transition-all"
                onClick={() => document.getElementById('edit-client-modal').showModal()}
                title="Edit client"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {client.status === 'active' && (
                <button
                  className="w-9 h-9 rounded-[8px] border border-[#1A263D] text-[#6B7FA3] hover:text-[#F59E0B] hover:border-[#F59E0B] flex items-center justify-center transition-all"
                  onClick={() => document.getElementById('discharge-confirm').showModal()}
                  title="Discharge client"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
              <button
                className="w-9 h-9 rounded-[8px] border border-[#1A263D] text-[#6B7FA3] hover:text-[#EF4444] hover:border-[#EF4444] flex items-center justify-center transition-all"
                onClick={() => document.getElementById('delete-confirm').showModal()}
                title="Delete client"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Monthly Fee */}
        <div className="card-premium p-4">
          <p className="text-[#3D4F6B] text-xs tracking-wider uppercase mb-2">Monthly Fee</p>
          <p className="text-[#F0F4FF] text-xl font-bold font-['DM_Serif_Display']">{formatKES(monthlyFee)}</p>
        </div>

        {/* Total Paid */}
        <div className="card-premium p-4">
          <p className="text-[#3D4F6B] text-xs tracking-wider uppercase mb-2">Total Paid</p>
          <p className="text-[#10B981] text-xl font-bold font-['DM_Serif_Display']">{formatKES(totalPaid)}</p>
        </div>

        {/* Outstanding Balance */}
        <div className="card-premium p-4">
          <p className="text-[#3D4F6B] text-xs tracking-wider uppercase mb-2">Outstanding Balance</p>
          <p className={`text-xl font-bold font-['DM_Serif_Display'] ${outstandingBalance < 0 ? 'text-[#10B981]' : outstandingBalance > 0 ? 'text-[#EF4444]' : 'text-[#F0F4FF]'}`}>
            {formatKES(outstandingBalance)}
          </p>
        </div>

        {/* Days Admitted */}
        <div className="card-premium p-4">
          <p className="text-[#3D4F6B] text-xs tracking-wider uppercase mb-2">Days Admitted</p>
          <p className="text-[#F0F4FF] text-xl font-bold font-['DM_Serif_Display'] font-mono">{daysAdmitted}</p>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-1 bg-[#0B1426] border border-[#1A263D] rounded-[10px] p-1 w-fit overflow-x-auto">
        {['Payments', 'Details', 'Billing Breakdown'].map(tab => (
          <button
            key={tab}
            className={`px-5 py-2 text-sm rounded-[8px] cursor-pointer transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#1A263D] text-[#F0F4FF] font-medium'
                : 'text-[#6B7FA3]'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="card-premium p-6 overflow-hidden">
        {/* ── TAB: PAYMENTS ── */}
        {activeTab === 'Payments' && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#F0F4FF] font-semibold">Payments</h2>
              <button
                className="btn-premium text-sm py-2 px-4"
                onClick={() => document.getElementById('payment-modal').showModal()}
              >
                + Record Payment
              </button>
            </div>

            {/* Payments Table */}
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1A263D]">
                      <th className="px-4 py-3 text-left text-[#3D4F6B] text-xs font-medium tracking-wider uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-[#3D4F6B] text-xs font-medium tracking-wider uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-[#3D4F6B] text-xs font-medium tracking-wider uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-[#3D4F6B] text-xs font-medium tracking-wider uppercase">Notes</th>
                      <th className="px-4 py-3 text-right text-[#3D4F6B] text-xs font-medium tracking-wider uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr
                        key={payment._id}
                        className="border-b border-[#1A263D] last:border-0 hover:bg-[rgba(14,25,48,0.6)] transition-colors duration-150 group"
                      >
                        <td className="px-4 py-3 text-[#6B7FA3] text-sm font-mono">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${getPaymentTypeBadge(payment.paymentType)}`}>
                            {payment.paymentType?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#10B981] font-semibold font-mono text-sm">
                          {formatKES(payment.amount)}
                        </td>
                        <td className="px-4 py-3 text-[#6B7FA3] text-sm max-w-[200px] truncate">
                          {payment.notes || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="opacity-0 group-hover:opacity-100 text-[#3D4F6B] hover:text-[#EF4444] transition-opacity"
                            onClick={() => handleDeletePayment(payment._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Empty State */
              <div className="card-premium p-12 text-center">
                <CreditCard className="w-10 h-10 text-[#1A263D] mx-auto mb-3" />
                <p className="text-[#6B7FA3] text-sm">No payments recorded yet</p>
                <button
                  className="btn-premium mt-4"
                  onClick={() => document.getElementById('payment-modal').showModal()}
                >
                  + Record First Payment
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: DETAILS ── */}
        {activeTab === 'Details' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="card-premium p-6">
              <h3 className="text-[#F0F4FF] font-semibold text-sm mb-4 pb-3 border-b border-[#1A263D]">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Name</span>
                  <span className="text-[#6B7FA3] text-sm text-right">{client.name}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Gender</span>
                  <span className="text-[#6B7FA3] text-sm text-right capitalize">{client.gender}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Date of Admission</span>
                  <span className="text-[#6B7FA3] text-sm font-mono text-right">{formatDate(client.dateOfAdmission)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Date of Discharge</span>
                  <span className="text-[#6B7FA3] text-sm font-mono text-right">
                    {client.dateOfDischarge ? formatDate(client.dateOfDischarge) : '—'}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Agreed Duration</span>
                  <span className="text-[#6B7FA3] text-sm text-right">{client.agreedDurationMonths} months</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Deposit Paid</span>
                  <span className="text-[#6B7FA3] text-sm font-mono text-right">{formatKES(client.depositAmount)}</span>
                </div>
              </div>
            </div>

            {/* Admission Details */}
            <div className="card-premium p-6">
              <h3 className="text-[#F0F4FF] font-semibold text-sm mb-4 pb-3 border-b border-[#1A263D]">Admission Details</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Monthly Fee</span>
                  <span className="text-[#6B7FA3] text-sm font-mono text-right">{formatKES(client.monthlyFee)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Medical Fee</span>
                  <span className="text-[#6B7FA3] text-sm font-mono text-right">{formatKES(client.medicalFee)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Daily Rate (post-expiry)</span>
                  <span className="text-[#6B7FA3] text-sm font-mono text-right">
                    {formatKES(client.customDailyRate || billing?.dailyRate || 1500)}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Current Phase</span>
                  <span className={`badge ${phaseInfo.color} text-right`}>{phaseInfo.label}</span>
                </div>
                {billing?.phase === 'post_expiry' && billing?.daysPostExpiry > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Days Past Expiry</span>
                    <span className="text-[#EF4444] text-sm font-mono text-right">+{billing.daysPostExpiry}d</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Structure */}
            <div className="card-premium p-6">
              <h3 className="text-[#F0F4FF] font-semibold text-sm mb-4 pb-3 border-b border-[#1A263D]">Fee Structure</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Total Charged</span>
                  <span className="text-[#F0F4FF] text-sm font-mono text-right">{formatKES(billing?.totalCharged)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Total Paid</span>
                  <span className="text-[#10B981] text-sm font-mono text-right">{formatKES(billing?.totalPaid)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Current Balance</span>
                  <span className={`text-sm font-mono text-right ${billing?.balance < 0 ? 'text-[#10B981]' : billing?.balance > 0 ? 'text-[#EF4444]' : 'text-[#F0F4FF]'}`}>
                    {formatKES(billing?.balance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sponsor Information */}
            <div className="card-premium p-6">
              <h3 className="text-[#F0F4FF] font-semibold text-sm mb-4 pb-3 border-b border-[#1A263D]">
                {client.sponsor ? 'Sponsor Information' : 'No Sponsor'}
              </h3>
              {client.sponsor ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Name</span>
                    <span className="text-[#6B7FA3] text-sm text-right">{client.sponsor.name}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Phone</span>
                    <span className="text-[#6B7FA3] text-sm text-right">{client.sponsor.phone || '—'}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Email</span>
                    <span className="text-[#6B7FA3] text-sm text-right">{client.sponsor.email || '—'}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Relationship</span>
                    <span className="text-[#6B7FA3] text-sm text-right capitalize">{client.sponsor.relationship || '—'}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-[#3D4F6B] text-xs tracking-wide uppercase">Address</span>
                    <span className="text-[#6B7FA3] text-sm text-right">{client.sponsor.address || '—'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[#6B7FA3] text-sm">No sponsor assigned</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: BILLING BREAKDOWN ── */}
        {activeTab === 'Billing Breakdown' && (
          <BillingBreakdown billing={billing} />
        )}
      </div>

      {/* Modals */}
      <Modal id="edit-client-modal" title="Edit Client" size="max-w-2xl">
        <ClientForm
          initial={client}
          onSubmit={handleUpdateClient}
          loading={submitting}
        />
      </Modal>

      <Modal id="payment-modal" title="Record Payment" size="max-w-lg">
        <PaymentForm
          clientName={client.name}
          onSubmit={handleAddPayment}
          loading={submitting}
        />
      </Modal>

      <ConfirmDialog
        id="discharge-confirm"
        title="Discharge Client"
        message={`Mark ${client.name} as discharged? This will stop all billing and alerts.`}
        onConfirm={handleDischarge}
        danger={false}
      />
      <ConfirmDialog
        id="delete-confirm"
        title="Delete Client"
        message={`Are you sure? This will permanently delete client ${client.name} and all associated payments. This action cannot be undone.`}
        onConfirm={handleDelete}
        danger={true}
      />
    </div>
  )
}
