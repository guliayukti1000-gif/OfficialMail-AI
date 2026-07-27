import { useState, useEffect, useRef } from 'react'
import { ShieldAlert, ScanSearch, AlertTriangle, Lightbulb } from 'lucide-react'
import { Card, Spinner } from '../components/UI'
import { analyzeSpamScore } from '../api'
import useSessionState from '../hooks/useSessionState'

function riskColor(level) {
  if (level === 'Low') return { ring: '#16a34a', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' }
  if (level === 'High') return { ring: '#dc2626', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' }
  return { ring: '#d97706', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' }
}

function ScoreRing({ score, level }) {
  const colors = riskColor(level)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} stroke="#e5e7eb" strokeWidth="10" fill="none" />
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
        <span className="text-3xl font-display font-bold text-ink-900">{score}</span>
        <span className="text-xs text-ink-500">/ 100</span>
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
    <div className="grid lg:grid-cols-2 gap-6 max-w-6xl">
      <Card>
        <h2 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <ShieldAlert size={18} className="text-brand-500" /> Write or Paste Email
        </h2>
        <textarea
          className="w-full min-h-[320px] resize-y input-field text-sm leading-relaxed"
          placeholder="Paste or write the email you want to check for spam risk..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <button className="btn-primary mt-4" onClick={handleAnalyze} disabled={loading}>
          {loading ? <Spinner /> : <ScanSearch size={16} />}
          {loading ? 'Analyzing…' : 'Analyze Spam Score'}
        </button>
      </Card>

      <Card>
        {result ? (
          <div className="space-y-6">
            <style>{`
              @keyframes flashRed {
                0%, 100% { background-color: transparent; }
                50% { background-color: rgba(220, 38, 38, 0.18); }
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
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">
                  <AlertTriangle size={14} /> Why it may look spammy
                </p>
                <ul className="space-y-1.5">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="text-sm text-ink-900 bg-surface-muted rounded-lg px-3 py-2">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggestions?.length > 0 && (
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">
                  <Lightbulb size={14} /> Suggestions to improve deliverability
                </p>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-ink-900 bg-surface-muted rounded-lg px-3 py-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 border-dashed border rounded-xl border-ink-300/50">
            <ShieldAlert size={28} className="text-ink-300 mb-3" />
            <p className="text-sm text-ink-500 max-w-xs">
              Your spam score, risk level, and suggestions will appear here.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}