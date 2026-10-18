export function formatInr(amount?: number): string {
  if (amount === undefined || amount === null) {
    return 'Price unavailable';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getScoreBadgeColor(score: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (score >= 8.0) {
    return {
      bg: 'bg-emerald-50 text-emerald-800',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Safer Choice'
    };
  } else if (score >= 5.5) {
    return {
      bg: 'bg-amber-50 text-amber-800',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Moderate Caution'
    };
  } else {
    return {
      bg: 'bg-rose-50 text-rose-800',
      text: 'text-rose-700',
      border: 'border-rose-200',
      label: 'High Concern'
    };
  }
}
