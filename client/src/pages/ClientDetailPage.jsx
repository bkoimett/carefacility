import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsApi, paymentsApi, alertsApi } from '../utils/api'
import { useFetch, useAsync } from '../hooks/useFetch'
import {
  formatKES, formatDate, getStatusColor, getPhaseLabel,
  getAlertTypeIcon, getAlertSeverityColor, timeAgo, daysUntilExpiry
} from '../utils/formatters'
import {
  PageHeader, Spinner, ErrorState, Modal, BalanceDisplay, ConfirmDialog
} from '../components/ui'
import ClientForm from '../components/clients/ClientForm'
import PaymentForm from '../components/payments/PaymentForm'
import PaymentLedger from '../components/payments/PaymentLedger'
import BillingBreakdown from '../components/payments/BillingBreakdown'
import { DetailSkeleton } from '../components/SkeletonLoader'
import { validateClient, validatePayment } from '../utils/validation'
import ValidationSummary from '../components/ValidationSummary'
import { showError, showSuccess, showValidationErrors } from '../components/ToastNotifications'

const TABS = ['Overview', 'Billing', 'Payments', 'Alerts']

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')
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
     // Frontend validation
     const validation = validatePayment(formData);
     if (!validation.isValid) {
       showValidationErrors(validation.errors);
       return;
     }
     
     await run(() => paymentsApi.create({ ...formData, clientId: id }))
     document.getElementById('payment-modal').close()
     refetch()
     showSuccess('Payment recorded successfully')
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title={client.name}
        subtitle={`Admitted ${formatDate(client.dateOfAdmission)} · ${client.agreedDurationMonths}-month agreement`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-ghost gap-1"
              onClick={() => navigate('/clients')}
            >
              ← Back
            </button>
            <button
              className="btn btn-sm btn-outline gap-1"
              onClick={() => document.getElementById('edit-client-modal').showModal()}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-sm btn-primary gap-1"
              onClick={() => document.getElementById('payment-modal').showModal()}
            >
              + Payment
            </button>
        {client.status === 'active' && (
              <button
                className="btn btn-sm btn-warning gap-1"
                onClick={() => document.getElementById('discharge-confirm').showModal()}
              >
                Discharge
              </button>
            )}
            <button
              className="btn btn-sm btn-error gap-1"
              onClick={() => document.getElementById('delete-confirm').showModal()}
            >
              Delete
            </button>
          </div>
        }
      />

      {/* Status & phase chips */}
      <div className="flex flex-wrap gap-2">
        <span className={`badge capitalize ${getStatusColor(client.status)}`}>{client.status}</span>
        <span className={`badge ${phaseInfo.color}`}>
          {phaseInfo.label}
          {billing?.phase === 'post_expiry' && billing?.daysPostExpiry > 0 && ` · +${billing.daysPostExpiry}d`}
        </span>
        {billing?.phase !== 'post_expiry' && daysLeft > 0 && (
          <span className="badge badge-ghost font-mono text-xs">{daysLeft}d until expiry</span>
        )}
        {billing?.phase !== 'post_expiry' && daysLeft <= 0 && (
          <span className="badge badge-warning font-mono text-xs">Expires today</span>
        )}
        {unreadAlerts.length > 0 && (
          <span className="badge badge-error gap-1">
            🔔 {unreadAlerts.length} alert{unreadAlerts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Quick balance banner */}
      <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4
        ${billing?.balance < 0 ? 'bg-error/5 border-error/20' : 'bg-success/5 border-success/20'}
      `}>
        <div className="flex-1">
          <p className="text-xs text-base-content/50 uppercase tracking-wider mb-1">Current Balance</p>
          <BalanceDisplay balance={billing?.balance} size="lg" />
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xs text-base-content/40">Charged</p>
            <p className="font-mono font-medium">{formatKES(billing?.totalCharged)}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/40">Paid</p>
            <p className="font-mono font-medium text-success">{formatKES(billing?.totalPaid)}</p>
          </div>
          {billing?.phase === 'post_expiry' && (
            <div>
              <p className="text-xs text-error/70">Daily rate</p>
              <p className="font-mono font-medium text-error">{formatKES(billing?.dailyRate)}/day</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab tab-bordered ${activeTab === tab ? 'tab-active font-semibold' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Alerts' && unreadAlerts.length > 0 && (
              <span className="ml-1.5 badge badge-error badge-xs">{unreadAlerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">

        {/* ── Overview ── */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <h4 className="font-display text-base mb-3">Client Details</h4>
              <dl className="space-y-2 text-sm">
                {[
                  ['Gender', client.gender],
                  ['Admission', formatDate(client.dateOfAdmission)],
                  ['Discharge', client.dateOfDischarge ? formatDate(client.dateOfDischarge) : '—'],
                  ['Agreed Duration', `${client.agreedDurationMonths} months`],
                  ['Monthly Fee', formatKES(client.monthlyFee)],
                  ['Medical Fee', formatKES(client.medicalFee)],
                  ['Deposit Paid', formatKES(client.depositAmount)],
                  ['Daily Rate (post-expiry)', formatKES(client.customDailyRate || billing?.dailyRate || 1500)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-base-200">
                    <dt className="text-base-content/50">{k}</dt>
                    <dd className="font-medium font-mono text-xs text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h4 className="font-display text-base mb-3">Sponsor</h4>
              {client.sponsor ? (
                <dl className="space-y-2 text-sm">
                  {[
                    ['Name', client.sponsor.name],
                    ['Phone', client.sponsor.phone || '—'],
                    ['Email', client.sponsor.email || '—'],
                    ['Relationship', client.sponsor.relationship],
                    ['Address', client.sponsor.address || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-base-200">
                      <dt className="text-base-content/50">{k}</dt>
                      <dd className="font-medium text-right max-w-[60%] break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-base-content/30 text-sm">No sponsor assigned</p>
              )}

              {client.comments && (
                <div className="mt-4">
                  <h4 className="font-display text-base mb-2">Comments / Directives</h4>
                  <pre className="bg-base-200 rounded-xl p-3 text-xs font-mono whitespace-pre-wrap text-base-content/70 max-h-40 overflow-y-auto">
                    {client.comments}
                  </pre>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Billing ── */}
        {activeTab === 'Billing' && (
          <BillingBreakdown billing={billing} />
        )}

        {/* ── Payments ── */}
        {activeTab === 'Payments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-base">Payment Ledger</h4>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => document.getElementById('payment-modal').showModal()}
              >
                + Add Payment
              </button>
            </div>
            <PaymentLedger payments={payments} onDelete={handleDeletePayment} />
          </div>
        )}

        {/* ── Alerts ── */}
        {activeTab === 'Alerts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-display text-base">Alerts</h4>
              <span className="text-xs text-base-content/40">{alerts.length} total</span>
            </div>
            {alerts.length === 0 ? (
              <p className="text-center text-base-content/30 py-8 text-sm">No alerts for this client</p>
            ) : (
              alerts.map(a => (
                <div
                  key={a._id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all
                    ${a.severity === 'critical' ? 'bg-error/5 border-error/20' :
                      a.severity === 'warning' ? 'bg-warning/5 border-warning/20' :
                      'bg-info/5 border-info/20'}
                    ${!a.isRead ? 'ring-1 ring-inset ring-primary/20' : 'opacity-70'}
                  `}
                >
                  <span className="text-lg mt-0.5">{getAlertTypeIcon(a.alertType)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold font-mono text-base-content/50 uppercase">
                        {a.alertType?.replace(/_/g, ' ')}
                      </span>
                      {!a.isRead && <span className="badge badge-primary badge-xs">New</span>}
                    </div>
                    <p className="text-sm leading-snug">{a.message}</p>
                    <p className="text-xs text-base-content/30 mt-1 font-mono">{timeAgo(a.createdAt)}</p>
                  </div>
                  <button
                    className="btn btn-xs btn-ghost text-base-content/30 hover:text-error shrink-0"
                    onClick={() => handleDismissAlert(a._id)}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
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
