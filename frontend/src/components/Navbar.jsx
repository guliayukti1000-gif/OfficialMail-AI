import { Menu } from 'lucide-react'

export default function Navbar({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 bg-[#0B0F1A]/80 backdrop-blur-md border-b border-white/10 px-5 lg:px-8 py-4 flex items-center gap-4">
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-300"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div>
        <h1 className="text-lg font-display font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
    </header>
  )
}