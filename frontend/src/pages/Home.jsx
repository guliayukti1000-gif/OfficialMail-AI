import { Link } from 'react-router-dom'
import { PenSquare, Inbox, LayoutTemplate, ArrowUpRight } from 'lucide-react'
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

const dots = [
  { left: '8%', size: 5, delay: '0s', duration: '9s' },
  { left: '22%', size: 3, delay: '2s', duration: '11s' },
  { left: '38%', size: 4, delay: '4s', duration: '8s' },
  { left: '55%', size: 3, delay: '1s', duration: '12s' },
  { left: '70%', size: 5, delay: '3s', duration: '10s' },
  { left: '85%', size: 4, delay: '5s', duration: '9s' },
]
export default function Home() {
  return (
    <div className="max-w-5xl">
      <div className="relative rounded-2xl overflow-hidden mb-10 px-8 py-12 bg-white border border-ink-300/40">
        <div className="hero-blob-one absolute top-[-80px] left-[-60px] w-80 h-80 rounded-full bg-brand-400 opacity-40 blur-3xl" />
        <div className="hero-blob-two absolute bottom-[-100px] right-[-40px] w-96 h-96 rounded-full bg-brand-900 opacity-30 blur-3xl" />
        <div className="hero-blob-three absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-brand-500 opacity-25 blur-2xl" />

        {dots.map((d, i) => (
          <span
            key={i}
            className="hero-dot absolute bottom-0 rounded-full bg-brand-500"
            style={{
              left: d.left,
              width: d.size,
              height: d.size,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          />
        ))}

        <div className="relative">
          <p className="text-xs font-mono uppercase tracking-widest text-brand-500 mb-2">
            Write with precision
          </p>
          <h2 className="text-3xl font-display font-extrabold text-ink-900 max-w-xl leading-tight">
            Every email, exactly as formal as it needs to be.
          </h2>
          <p className="text-ink-500 mt-3 max-w-lg">
            OfficialMail AI drafts, edits, and summarizes correspondence so you
            never have to stare at a blank compose window again.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {actions.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to}>
            <Card className="h-full group hover:shadow-glow hover:border-brand-400/50 transition-all">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-500" />
                </div>
              <div className="flex items-start justify-between">
                <h3 className="font-display font-semibold text-ink-900">{title}</h3>
                <ArrowUpRight
                  size={18}
                  className="text-ink-300 group-hover:text-brand-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                />
              </div>
              <p className="text-sm text-ink-500 mt-2">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-ink-900">
            Formal by default, always
          </h3>
          <p className="text-sm text-ink-500 mt-1">
            Every draft is checked for professional tone — informal or slang
            phrasing is never returned.
          </p>
        </div>
        <Link to="/generate" className="btn-primary whitespace-nowrap">
          Draft an email
        </Link>
      </Card>
       </div>
  )
}