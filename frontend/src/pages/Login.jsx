import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { Mail, Lock, Sparkles } from 'lucide-react'

function LoginConstellation() {
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
      const count = Math.round((width * height) / 6500)
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        r: Math.random() * 1.5 + 0.4,
      }))
    }

    function step() {
      ctx.clearRect(0, 0, width, height)
      // attractor point = roughly where the robot floats (top-center of the card area)
      const ax = width / 2
      const ay = height * 0.32

      for (const p of particles) {
        if (!reduced) {
          const dx = ax - p.x
          const dy = ay - p.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          // gentle pull toward the robot, stronger the farther out
          p.vx += (dx / dist) * 0.0025
          p.vy += (dy / dist) * 0.0025
          p.vx *= 0.98
          p.vy *= 0.98
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
          if (dist < 120) {
            ctx.strokeStyle = `rgba(61,90,254,${(1 - dist / 120) * 0.3})`
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
        ctx.fillStyle = 'rgba(245,166,35,0.55)'
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

function RobotMascot({ wink }) {
  return (
    <svg width="110" height="110" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="loginRobotBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3D5AFE" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>
      <line x1="75" y1="18" x2="75" y2="34" stroke="#F5A623" strokeWidth="3" />
      <circle cx="75" cy="14" r="5" fill="#F5A623" />
      <rect x="35" y="34" width="80" height="56" rx="18" fill="url(#loginRobotBody)" opacity="0.9" />
      <circle cx="60" cy="62" r="6" fill="#080A14" />
      {wink ? (
        <line x1="84" y1="62" x2="96" y2="62" stroke="#080A14" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <circle cx="90" cy="62" r="6" fill="#080A14" />
      )}
      <rect x="45" y="94" width="60" height="42" rx="14" fill="url(#loginRobotBody)" opacity="0.75" />
      <circle cx="75" cy="114" r="8" fill="#F5A623">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [wink, setWink] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const id = setInterval(() => {
      setWink(true)
      setTimeout(() => setWink(false), 260)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-night px-4 relative overflow-hidden">
      <style>{`
        @keyframes ringSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes signalPulse {
          0%   { transform: scale(0.8); opacity: 0.6; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .glow-ring-wrap {
  position: relative;
  border-radius: 2rem;
  padding: 2px;
  overflow: hidden;
  isolation: isolate;
}
.glow-ring-wrap::before {
  content: '';
  position: absolute;
  inset: -60%;
  background: conic-gradient(from 0deg, #3D5AFE, #F5A623, #3D5AFE);
  animation: ringSpin 6s linear infinite;
  z-index: 0;
}
.glow-ring-wrap > .glow-ring-inner {
  position: relative;
  z-index: 1;
}
.signal-ring {
  animation: signalPulse 2.4s ease-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .glow-ring-wrap::before { animation: none; }
  .signal-ring { animation: none; opacity: 0; }
}
      `}</style>

      <LoginConstellation />

      {/* bigger, more saturated ambient glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[650px] h-[650px] bg-accent/30 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[650px] h-[650px] bg-flare/30 rounded-full blur-[140px]" />

      <div className="relative w-full max-w-sm z-10">
        <div className="text-center mb-6">
          <div
            className="relative w-16 h-16 mx-auto mb-4 animate-blur-in"
            style={{ animationDelay: '50ms' }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/40 to-flare/40 blur-xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-flare flex items-center justify-center shadow-flareGlow">
              <Sparkles size={26} className="text-night" />
            </div>
          </div>
          <h1
            className="text-3xl font-bold mb-1 animate-blur-in bg-gradient-to-r from-accent via-white to-flare bg-clip-text text-transparent"
            style={{ animationDelay: '160ms' }}
          >
            Welcome to OfficialMail AI
          </h1>
          <p
            className="text-sm text-slate-400 animate-blur-in"
            style={{ animationDelay: '260ms' }}
          >
            Your intelligent email assistant
          </p>
        </div>

        {/* Robot peeking above the glass card, with a pulsing signal ring behind it */}
        <div className="relative flex justify-center -mb-8 z-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="signal-ring w-28 h-28 rounded-full border-2 border-flare/50" />
          </div>
          <div
            className="relative animate-blur-in"
            style={{ animationDelay: '300ms', animation: 'float 5s ease-in-out infinite' }}
          >
            <RobotMascot wink={wink} />
          </div>
        </div>

        {/* Glass-coaster card with a rotating gradient glow ring */}
        <div className="relative rounded-[2rem] glow-ring-wrap shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
          <div className="glow-ring-inner backdrop-blur-2xl bg-night-glass/80 border border-white/10 rounded-[2rem] pt-12 pb-8 px-8 overflow-hidden">
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[140%] h-32 bg-gradient-to-b from-white/10 to-transparent rounded-full blur-md" />

            <h2
              className="text-xl font-semibold text-white mb-1 animate-blur-in relative"
              style={{ animationDelay: '340ms' }}
            >
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p
              className="text-sm text-slate-400 mb-6 animate-blur-in relative"
              style={{ animationDelay: '400ms' }}
            >
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
            </p>

            <form
              onSubmit={handleEmailAuth}
              className="space-y-3 animate-blur-in relative"
              style={{ animationDelay: '460ms' }}
            >
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-shadow"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-shadow"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-flare text-night text-sm font-medium shadow-flareGlow hover:shadow-[0_0_30px_rgba(245,166,35,0.5)] transition-shadow disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div
              className="flex items-center gap-3 my-5 animate-blur-in relative"
              style={{ animationDelay: '540ms' }}
            >
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs text-slate-500">OR</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50 animate-blur-in relative"
              style={{ animationDelay: '600ms' }}
              disabled={loading}
            >
              Continue with Google
            </button>

            <p
              className="text-sm text-slate-400 text-center mt-6 animate-blur-in relative"
              style={{ animationDelay: '660ms' }}
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                className="text-flare font-medium hover:underline"
                onClick={() => setIsSignUp((s) => !s)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}