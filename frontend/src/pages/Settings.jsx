import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Shield, Info, Check, Moon, Sun, LogOut, Trash2 } from 'lucide-react'
import { Card } from '../components/UI'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { deleteAccount } from '../api'

const DEFAULTS = { name: '', tone: 'Formal', language: 'English' }

export default function Settings() {
  const [prefs, setPrefs] = useState(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount(user.uid)
      await signOut(auth)
      navigate('/login')
    } catch (e) {
      setDeleteError('Could not delete account. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-ink-900 dark:text-white mb-1">Settings</h2>
        <p className="text-ink-500 dark:text-ink-300">Personalize your default email preferences.</p>
      </div>

      {user && (
        <Card>
          <h3 className="font-display font-semibold text-red-600 mb-4 flex items-center gap-2">
            <Trash2 size={18} /> Account Actions
          </h3>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center rounded-xl border border-ink-300/60 dark:border-white/10 text-ink-700 dark:text-white font-medium px-5 py-2.5 hover:bg-surface-muted dark:hover:bg-ink-900 transition-colors mb-3"
          >
            <LogOut size={16} /> Logout
          </button>
          {deleteError && <p className="text-sm text-red-600 mb-2">{deleteError}</p>}
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full flex items-center gap-2 justify-center rounded-xl bg-red-600 text-white font-medium px-5 py-2.5 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting ? 'Deleting…' : confirmDelete ? 'Click again to permanently delete' : 'Delete Account'}
          </button>
          {confirmDelete && !deleting && (
            <p className="text-xs text-red-500 mt-2 text-center">This will permanently delete your account and all your data. This cannot be undone.</p>
          )}
        </Card>
      )}

      <Card>
        <h3 className="font-display font-semibold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          {theme === 'dark' ? <Moon size={18} className="text-brand-500" /> : <Sun size={18} className="text-brand-500" />}
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-700 dark:text-ink-300">Dark mode</span>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-500' : 'bg-ink-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={18} className="text-brand-500" /> Profile
        </h3>
        <label className="label-text">Display Name</label>
        <input className="input-field" placeholder="Your name" value={prefs.name} onChange={update('name')} />
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
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
        <h3 className="font-display font-semibold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-brand-500" /> Data
        </h3>
        <p className="text-sm text-ink-500 dark:text-ink-300">
          Your generated emails are stored in your Firestore project under the
          <code className="mx-1 px-1.5 py-0.5 bg-surface-muted dark:bg-ink-900 rounded font-mono text-xs">history</code>
          collection. Delete entries anytime from the History page.
        </p>
      </Card>

      {user && (
        <Card>
          <h3 className="font-display font-semibold text-red-600 mb-4 flex items-center gap-2">
            Account Actions
          </h3>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center rounded-xl border border-ink-300/60 dark:border-white/10 text-ink-700 dark:text-white font-medium px-5 py-2.5 hover:bg-surface-muted dark:hover:bg-ink-900 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </Card>
      )}

      <div className="flex items-start gap-2 text-xs text-ink-500 dark:text-ink-300">
        <Info size={14} className="mt-0.5 shrink-0" />
        Your name and default tone/language are saved in this browser and used automatically on the Generate Email page.
      </div>
    </div>
  )
}