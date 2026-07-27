import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { Mail, Lock, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] px-4 relative overflow-hidden">
      <svg
        viewBox="0 0 800 800"
        className="absolute inset-0 w-full h-full opacity-20 animate-[float_6s_ease-in-out_infinite]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="botGradBg" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stopColor="#22D3EE" />
  <stop offset="50%" stopColor="#6366F1" />
  <stop offset="100%" stopColor="#D946EF" />
</linearGradient>
        </defs>
        <g transform="translate(400,400) scale(2.4)">
  <line x1="0" y1="-160" x2="0" y2="-195" stroke="url(#botGradBg)" strokeWidth="6" strokeLinecap="round" />
  <circle cx="0" cy="-205" r="12" fill="url(#botGradBg)" />
  <rect x="-90" y="-160" width="180" height="140" rx="46" fill="url(#botGradBg)" stroke="#22D3EE" strokeWidth="3" strokeOpacity="0.6" />
  <rect x="-58" y="-108" width="38" height="38" rx="13" fill="#0B0F1A" stroke="#22D3EE" strokeWidth="2" className="animate-[blink_4s_ease-in-out_infinite]" />
  <rect x="20" y="-108" width="38" height="38" rx="13" fill="#0B0F1A" stroke="#22D3EE" strokeWidth="2" className="animate-[blink_4s_ease-in-out_infinite]" />
  <rect x="-110" y="-10" width="220" height="170" rx="46" fill="url(#botGradBg)" stroke="#D946EF" strokeWidth="3" strokeOpacity="0.5" />
  <circle cx="0" cy="75" r="28" fill="#22D3EE" opacity="0.6" className="animate-pulse" />
  <circle cx="0" cy="75" r="40" fill="none" stroke="#22D3EE" strokeWidth="2" strokeOpacity="0.4" />
  <rect x="-160" y="10" width="36" height="110" rx="18" fill="url(#botGradBg)" />
  <rect x="124" y="10" width="36" height="110" rx="18" fill="url(#botGradBg)" />
</g>
      </svg>

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-sm z-10">
        <div className="text-center mb-6">
  <div className="relative w-16 h-16 mx-auto mb-4">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/40 to-purple-500/40 blur-xl" />
    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
      <Sparkles size={26} className="text-white" />
    </div>
  </div>
  <h1 className="text-2xl font-semibold text-white mb-1">Welcome to OfficialMail AI</h1>
  <p className="text-sm text-slate-400">Your intelligent email assistant</p>
</div>

        <div className="backdrop-blur-2xl bg-[#0F1420]/80 border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8">
          <h2 className="text-xl font-semibold text-white mb-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
          </p>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-shadow"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-shadow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Continue with Google
          </button>

          <p className="text-sm text-slate-400 text-center mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              className="text-blue-400 font-medium hover:underline"
              onClick={() => setIsSignUp((s) => !s)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}