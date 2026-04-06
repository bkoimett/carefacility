import { format, formatDistanceToNow, differenceInDays, addDays } from 'date-fns'

export const formatKES = (amount) => {
  if (amount === null || amount === undefined) return '—'
  const abs = Math.abs(amount)
  const formatted = `KES ${abs.toLocaleString('en-KE')}`
  if (amount < 0) return `−${formatted}`
  return formatted
}

export const formatDate = (date) => {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy, HH:mm')
}

export const timeAgo = (date) => {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const getPhaseLabel = (phase) => {
  switch (phase) {
    case 'post_expiry': return { label: 'Post-Expiry', color: 'badge-error' }
    case 'within_duration': return { label: 'Active', color: 'badge-success' }
    default: return { label: phase, color: 'badge-neutral' }
  }
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'badge-success'
    case 'discharged': return 'badge-neutral'
    case 'absconded': return 'badge-warning'
    default: return 'badge-ghost'
  }
}

export const getAlertSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'alert-error'
    case 'warning': return 'alert-warning'
    case 'info': return 'alert-info'
    default: return 'alert-info'
  }
}

export const getAlertTypeIcon = (type) => {
  switch (type) {
    case 'FIRST_MONTH_DUE': return '📅'
    case 'MONTHLY_FEE_DUE': return '💳'
    case 'EXPIRY_WARNING': return '⚠️'
    case 'EXPIRY_OVERDUE': return '🚨'
    case 'SPONSOR_REMINDER': return '📞'
    case 'DAILY_CHARGE_ALERT': return '📈'
    default: return '🔔'
  }
}

export const getBalanceClass = (balance) => {
  if (balance > 0) return 'amount-positive'
  if (balance < 0) return 'amount-negative'
  return 'amount-zero'
}

export const daysUntilExpiry = (dateOfAdmission, agreedDurationMonths) => {
  if (!dateOfAdmission) return null
  const expiry = addDays(new Date(dateOfAdmission), agreedDurationMonths * 30)
  return differenceInDays(expiry, new Date())
}
