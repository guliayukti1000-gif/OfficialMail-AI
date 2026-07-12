export function Card({ children, className = '' }) {
  return <div className={`card p-6 ${className}`}>{children}</div>
}

export function Spinner({ className = '' }) {
  return (
    <div
      className={`w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin ${className}`}
    />
  )
}

export function PriorityBadge({ priority }) {
  const styles = {
    High: 'bg-red-50 text-red-600 border-red-200',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200',
    Low: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  }
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
        styles[priority] || styles.Medium
      }`}
    >
      {priority} priority
    </span>
  )
}
