import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Shield, Info, Check } from 'lucide-react'
import { Card } from '../components/UI'

const DEFAULTS = { name: '', tone: 'Formal', language: 'English' }

export default function Settings() {
  const [prefs, setPrefs] = useState(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('officialmail_prefs')
    if (stored) {
      try {
        setPrefs({ ...DEFAULTS, ...JSON.parse(stored) })
      } catch {}
    }
  }, [])

  const update = (key) => (e) => setPrefs((p) => ({ ...p, [key]: e.target.value }))

  const handleSave = () => {
    localStorage.setItem('officialmail_prefs', JSON.stringify(prefs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">Settings</h2>
        <p className="text-ink-500">Personalize your default email preferences.</p>
      </div>

      <Card>
        <h3 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <User size={18} className="text-brand-500" /> Profile
        </h3>
        <label className="label-text">Display Name</label>
        <input className="input-field" placeholder="Your name" value={prefs.name} onChange={update('name')} />
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <SettingsIcon size={18} className="text-brand-500" /> Default Preferences
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Default Tone</label>
            <select className="input-field" value={prefs.tone} onChange={update('tone')}>
              {['Formal', 'Polite', 'Assertive', 'Persuasive', 'Neutral'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Default Language</label>
            <select className="input-field" value={prefs.language} onChange={update('language')}>
              {['English', 'Hindi'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button className="btn-primary mt-5" onClick={handleSave}>
          {saved ? <Check size={16} /> : null}
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-brand-500" /> Data
        </h3>
        <p className="text-sm text-ink-500">
          Your generated emails are stored in your Firestore project under the
          <code className="mx-1 px-1.5 py-0.5 bg-surface-muted rounded font-mono text-xs">history</code>
          collection. Delete entries anytime from the History page.
        </p>
      </Card>

      <div className="flex items-start gap-2 text-xs text-ink-500">
        <Info size={14} className="mt-0.5 shrink-0" />
        Your name and default tone/language are saved in this browser and used automatically on the Generate Email page.
      </div>
    </div>
  )
}