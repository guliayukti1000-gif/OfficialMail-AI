import { NavLink } from 'react-router-dom'
import { Mail, Home, PenSquare, Inbox, LayoutTemplate, History, Settings, Sparkles, Send, ShieldAlert } from 'lucide-react'
const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/generate', label: 'Generate Email', icon: PenSquare },
  { to: '/inbox-summary', label: 'Inbox Summary', icon: Inbox },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/bulk-send', label: 'Bulk Send', icon: Send },
  { to: '/spam-checker', label: 'Spam Checker', icon: ShieldAlert },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ink-900/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-ink-300/40 z-40 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
            <Mail size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-ink-900 leading-none">OfficialMail</p>
            <p className="text-[11px] font-mono text-brand-500 tracking-wide">AI</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-ink-700 hover:bg-surface-muted'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-900 text-white">
          <Sparkles size={18} className="mb-2" />
          <p className="text-sm font-semibold leading-snug">Powered by Gemini</p>
          <p className="text-xs text-white/70 mt-1">Every email, precisely worded.</p>
        </div>
      </aside>
    </>
  )
}
