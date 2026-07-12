import { Menu } from 'lucide-react'

export default function Navbar({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 bg-surface-soft/80 backdrop-blur-sm border-b border-ink-300/30 px-5 lg:px-8 py-4 flex items-center gap-4">
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-surface-muted"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div>
        <h1 className="text-lg font-display font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
      </div>
    </header>
  )
}
