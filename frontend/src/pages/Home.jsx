import { useEffect, useRef, useState } from 'react'
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

function RobotMascot({ wink }) {
  return (
    <svg width="140" height="140" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="homeRobotBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3D5AFE" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>
      <line x1="75" y1="18" x2="75" y2="34" stroke="#F5A623" strokeWidth="3" />
      <circle cx="75" cy="14" r="5" fill="#F5A623" />
      <rect x="35" y="34" width="80" height="56" rx="18" fill="url(#homeRobotBody)" opacity="0.9" />
      <circle cx="60" cy="62" r="6" fill="#080A14" />
      {wink ? (
        <line x1="84" y1="62" x2="96" y2="62" stroke="#080A14" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <circle cx="90" cy="62" r="6" fill="#080A14" />
      )}
      <rect x="45" y="94" width="60" height="42" rx="14" fill="url(#homeRobotBody)" opacity="0.75" />
      <circle cx="75" cy="114" r="8" fill="#F5A623">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function HeroConstellation() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width, height, particles, raf
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * DPR
      canvas.height = height * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      const count = Math.round((width * height) / 9000)
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.3 + 0.4,
      }))
    }

    function step() {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1
        }
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 90) {
            ctx.strokeStyle = `rgba(61,90,254,${(1 - dist / 90) * 0.25})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      for (const p of particles) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(245,166,35,0.5)'
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(step)
    }

    resize()
    step()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

export default function Home() {
  const [wink, setWink] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const id = setInterval(() => {
      setWink(true)
      setTimeout(() => setWink(false), 260)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="max-w-5xl">
      <div className="relative rounded-2xl overflow-hidden mb-10 px-8 py-14 bg-night-glass border border-white/[0.06]">
        <HeroConstellation />

        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <p
              className="text-xs font-mono uppercase tracking-widest text-flare mb-3 animate-blur-in"
              style={{ animationDelay: '50ms' }}
            >
              Your AI-powered email assistant
            </p>
            <h2
              className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight animate-blur-in"
              style={{ animationDelay: '150ms' }}
            >
              Generate, summarize, protect, and respond to emails effortlessly.
            </h2>
            <p
              className="text-slate-400 mt-4 max-w-xl animate-blur-in"
              style={{ animationDelay: '280ms' }}
            >
              OfficialMail AI drafts, edits, and summarizes correspondence so you
              never have to stare at a blank compose window again.
            </p>
            <div
              className="flex items-center justify-center md:justify-start gap-3 mt-7 animate-blur-in"
              style={{ animationDelay: '420ms' }}
            >
              <Link
                to="/generate"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-flare text-night text-sm font-medium shadow-flareGlow hover:shadow-[0_0_30px_rgba(245,166,35,0.5)] transition-shadow"
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

          <div
            className="shrink-0 animate-blur-in"
            style={{ animationDelay: '200ms', animation: 'float 6s ease-in-out infinite' }}
          >
            <RobotMascot wink={wink} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {actions.map(({ to, icon: Icon, title, desc }, i) => (
          <Link key={to} to={to}>
            <div
              className="h-full p-5 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-accent/40 hover:bg-white/[0.06] transition-all group animate-blur-in"
              style={{ animationDelay: `${560 + i * 110}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-flare/20 border border-white/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-flare" />
              </div>
              <div className="flex items-start justify-between">
                <h3 className="font-display font-semibold text-white">{title}</h3>
                <ArrowUpRight
                  size={18}
                  className="text-slate-500 group-hover:text-flare group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
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
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-flare text-night text-sm font-medium whitespace-nowrap shadow-flareGlow"
        >
          Draft an email
        </Link>
      </div>
    </div>
  )
}