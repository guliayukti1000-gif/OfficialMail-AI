export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 p-6 ${className}`}>
      {children}
    </div>
  )
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
    High: 'bg-red-500/10 text-red-400 border-red-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
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