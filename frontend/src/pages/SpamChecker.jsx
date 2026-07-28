import { useState, useEffect, useRef } from 'react'
import { ShieldAlert, ScanSearch, AlertTriangle, Lightbulb } from 'lucide-react'
import { Card, Spinner } from '../components/UI'
import { analyzeSpamScore } from '../api'
import useSessionState from '../hooks/useSessionState'

function riskColor(level) {
  if (level === 'Low') return { ring: '#34D399', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' }
  if (level === 'High') return { ring: '#F87171', badge: 'bg-red-500/10 text-red-400 border border-red-500/30' }
  return { ring: '#FBBF24', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' }
}

function ScoreRing({ score, level }) {
  const colors = riskColor(level)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
        <circle
          cx="60" cy="60" r={radius}
          stroke={colors.ring}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  )
}

export default function SpamChecker() {
  const [text, setText] = useSessionState('spamChecker_text', '')
  const [result, setResult] = useSessionState('spamChecker_result', null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flashing, setFlashing] = useState(false)
  const audioCtxRef = useRef(null)

  const playBeep = () => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 880
      gain.gain.value = 0.15
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.3)
    } catch (e) {
      // audio blocked/unsupported — fail silently
    }
  }

  useEffect(() => {
    if (result?.risk_level === 'High') {
      setFlashing(true)
      playBeep()
      const timer = setTimeout(() => setFlashing(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [result])

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Paste or write an email to analyze first.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await analyzeSpamScore(text)
      setResult(data)
    } catch (e) {
      setError('Could not analyze this email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const colors = result ? riskColor(result.risk_level) : null

  return (
    <div className="relative">
      <div className="absolute top-[-100px] left-[10%] w-72 h-72 rounded-full bg-blue-500 opacity-[0.15] blur-3xl animate-[drift_9s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[5%] w-80 h-80 rounded-full bg-purple-600 opacity-[0.15] blur-3xl animate-[drift_11s_ease-in-out_infinite] pointer-events-none" />

      <div className="relative grid lg:grid-cols-2 gap-6 max-w-6xl">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-blue-400" /> Write or Paste Email
          </h2>
          <textarea
            className="w-full min-h-[320px] resize-y input-field text-sm leading-relaxed"
            placeholder="Paste or write the email you want to check for spam risk..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          <button className="btn-primary mt-4" onClick={handleAnalyze} disabled={loading}>
            {loading ? <Spinner /> : <ScanSearch size={16} />}
            {loading ? 'Analyzing…' : 'Analyze Spam Score'}
          </button>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          {result ? (
            <div className="space-y-6">
              <style>{`
                @keyframes flashRed {
                  0%, 100% { background-color: transparent; }
                  50% { background-color: rgba(220, 38, 38, 0.25); }
                }
                .flash-red {
                  animation: flashRed 0.5s ease-in-out 6;
                  border-radius: 1rem;
                }
              `}</style>
              <div className={`flex flex-col items-center py-2 ${flashing ? 'flash-red' : ''}`}>
                <ScoreRing score={result.spam_score} level={result.risk_level} />
                <span className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                  {result.risk_level} Risk
                </span>
              </div>

              {result.reasons?.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    <AlertTriangle size={14} /> Why it may look spammy
                  </p>
                  <ul className="space-y-1.5">
                    {result.reasons.map((r, i) => (
                      <li key={i} className="text-sm text-white bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestions?.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    <Lightbulb size={14} /> Suggestions to improve deliverability
                  </p>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-white bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 border-dashed border rounded-xl border-white/10">
              <ShieldAlert size={28} className="text-slate-500 mb-3" />
              <p className="text-sm text-slate-400 max-w-xs">
                Your spam score, risk level, and suggestions will appear here.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}