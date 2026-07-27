import { useState, useEffect } from 'react'
import { X, Volume2, VolumeX } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false)
  const { speak, stop, speaking } = useSpeech()

  useEffect(() => {
    return () => stop()
  }, [])

  const readPage = () => {
    const main = document.querySelector('main') || document.body
    const text = main.innerText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000)
    speak(text)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="card p-4 w-64">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-display font-semibold text-ink-900">
              Hi! I'm here to help.
            </p>
            <button onClick={() => setOpen(false)} className="text-ink-500 hover:text-ink-900">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-ink-500 mb-3">
            Fill in the details and I'll draft a polished, professional email for you.
          </p>
          <button
            className="btn-primary w-full !py-2 text-xs"
            onClick={() => (speaking ? stop() : readPage())}
          >
            {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {speaking ? 'Stop Reading' : 'Read This Page'}
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Assistant"
        className="assistant-bob"
      >
        <svg width="64" height="64" viewBox="0 0 64 64">
          <defs>
            <linearGradient id="botGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="34" r="24" fill="url(#botGrad)" />
          <circle className="assistant-eye" cx="24" cy="32" r="3.5" fill="white" />
          <circle className="assistant-eye" cx="40" cy="32" r="3.5" fill="white" />
          <path d="M24 42 Q32 48 40 42" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="8" r="3" fill="#93C5FD" />
          <line x1="32" y1="11" x2="32" y2="16" stroke="#93C5FD" strokeWidth="2" />
        </svg>
      </button>
    </div>
  )
}