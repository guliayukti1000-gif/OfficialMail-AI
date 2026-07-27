import { Link } from 'react-router-dom'
import { PenSquare, Inbox, LayoutTemplate, ArrowUpRight, Mail } from 'lucide-react'
import { Card } from '../components/UI'

const actions = [
  {
    to: '/generate',
    icon: PenSquare,
    title: 'Generate an email',
    desc: 'Turn a few key points into a polished, professional email.',
  },
  {
    to: '/inbox-summary',
    icon: Inbox,
    title: 'Summarize an inbox email',
    desc: 'Paste a long email and get the summary, deadlines, and action items.',
  },
  {
    to: '/templates',
    icon: LayoutTemplate,
    title: 'Start from a template',
    desc: 'Leave, internship, complaint, and more — ready to customize.',
  },
]

const floatingIcons = [
  { left: '8%', top: '20%', size: 22, delay: '0s', duration: '9s' },
  { left: '22%', top: '65%', size: 16, delay: '2s', duration: '11s' },
  { left: '40%', top: '15%', size: 18, delay: '4s', duration: '8s' },
  { left: '62%', top: '55%', size: 20, delay: '1s', duration: '12s' },
  { left: '80%', top: '25%', size: 16, delay: '3s', duration: '10s' },
  { left: '92%', top: '70%', size: 22, delay: '5s', duration: '9s' },
]

export default function Home() {
  return (
    <div className="max-w-5xl">
      <div className="relative rounded-2xl overflow-hidden mb-10 px-8 py-14 bg-[#0F1420] border border-white/10">
        <div className="absolute top-[-80px] left-[-60px] w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl animate-[drift_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-100px] right-[-40px] w-96 h-96 rounded-full bg-purple-600 opacity-20 blur-3xl animate-[drift_10s_ease-in-out_infinite]" />

        {floatingIcons.map((d, i) => (
          <Mail
            key={i}
            size={d.size}
            className="absolute text-blue-400/30 animate-[float_6s_ease-in-out_infinite]"
            style={{ left: d.left, top: d.top, animationDelay: d.delay, animationDuration: d.duration }}
          />
        ))}

        <div className="relative text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-3">
            Your AI-powered email assistant
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white max-w-2xl mx-auto leading-tight">
            Generate, summarize, protect, and respond to emails effortlessly.
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">
            OfficialMail AI drafts, edits, and summarizes correspondence so you
            never have to stare at a blank compose window again.
          </p>
          <div className="flex items-center justify-center gap-3 mt-7">
            <Link
              to="/generate"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow"
            >
              Get Started
            </Link>
            <Link
              to="/inbox-summary"
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {actions.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to}>
            <div className="h-full p-5 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-blue-400/40 hover:bg-white/[0.06] transition-all group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-blue-400" />
              </div>
              <div className="flex items-start justify-between">
                <h3 className="font-display font-semibold text-white">{title}</h3>
                <ArrowUpRight
                  size={18}
                  className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                />
              </div>
              <p className="text-sm text-slate-400 mt-2">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-white">
            Formal by default, always
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Every draft is checked for professional tone — informal or slang
            phrasing is never returned.
          </p>
        </div>
        <Link
          to="/generate"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          Draft an email
        </Link>
      </div>
    </div>
  )
}