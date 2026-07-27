import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Mic } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'

export default function VoiceAssistant() {
  const { speak, stop, speaking } = useSpeech()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    return () => stop()
  }, [])

  const readPage = () => {
    const main = document.querySelector('main') || document.body
    const text = main.innerText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000) // keep it reasonable
    speak(text)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white dark:bg-ink-700 rounded-2xl shadow-card border border-ink-300/40 dark:border-white/10 p-3 w-56 text-sm">
          <p className="text-ink-700 dark:text-ink-300 mb-3">Read the current page aloud?</p>
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
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-glow transition-colors ${
          speaking ? 'bg-red-500' : 'bg-brand-500 hover:bg-brand-600'
        }`}
      >
        <Mic size={22} className="text-white" />
      </button>
    </div>
  )
}