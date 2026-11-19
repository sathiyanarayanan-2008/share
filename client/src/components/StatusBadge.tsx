import React from 'react';
import { DonationStatus, ClaimStatus, PickupStatus, VerificationStatus } from '../types';

interface StatusBadgeProps {
  status: DonationStatus | ClaimStatus | PickupStatus | VerificationStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (status) {
    case 'AVAILABLE':
    case 'VERIFIED':
    case 'CONFIRMED':
    case 'FULFILLED':
      colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      break;
    case 'RESERVED':
    case 'ASSIGNED':
      colorClasses = 'bg-teal-950/80 text-teal-300 border-teal-800/60 shadow-[0_0_10px_rgba(20,184,166,0.15)]';
      break;
    case 'PICKED_UP':
    case 'IN_TRANSIT':
    case 'COLLECTED':
    case 'EN_ROUTE_TO_NGO':
    case 'EN_ROUTE_TO_DONOR':
      colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
      break;
    case 'COMPLETED':
      colorClasses = 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      break;
    case 'PENDING':
    case 'OPEN':
      colorClasses = 'bg-amber-950/70 text-amber-400 border-amber-800/50';
      break;
    case 'CANCELLED':
    case 'REJECTED':
    case 'FAILED':
    case 'EXPIRED':
      colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-semibold ${padding} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
