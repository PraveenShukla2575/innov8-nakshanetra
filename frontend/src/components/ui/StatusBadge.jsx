import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

const statusConfig = {
  COMPLIANT: {
    label: 'Compliant',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500/20',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500/20',
  },
  NON_COMPLIANT: {
    label: 'Non-Compliant',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-500/20',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-500/20',
  },
  PASSED: {
    label: 'Passed',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500/20',
  },
  VIOLATION: {
    label: 'Violation',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-500/20',
  },
  PENDING: {
    label: 'Pending Review',
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-500/20',
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-500/20',
  },
  FLAGGED: {
    label: 'Flagged',
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-500/20',
  },
};

export const StatusBadge = ({ status = 'PENDING', size = 'md', showIcon = true }) => {
  const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : 'PENDING';
  const config = statusConfig[normalizedStatus] || statusConfig.PENDING;
  const Icon = config.icon;
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-3 py-1 text-xs font-semibold gap-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center rounded-full ring-1 ring-inset ${config.bg} ${config.text} ${config.ring} ${sizeClasses}`}
    >
      {showIcon && <Icon size={iconSize} strokeWidth={2.2} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
