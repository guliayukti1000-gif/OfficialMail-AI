import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Shield, Info, Check, LogOut, Trash2 } from 'lucide-react'
import { Card } from '../components/UI'
import { useAuth } from '../hooks/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { deleteAccount } from '../api'

const DEFAULTS = { name: '', tone: 'Formal', language: 'English' }

export default function Settings() {
  const [prefs, setPrefs] = useState(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()
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
    <div className="relative">
      <div className="absolute top-[-100px] left-[10%] w-72 h-72 rounded-full bg-blue-500 opacity-[0.15] blur-3xl animate-[drift_9s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[5%] w-80 h-80 rounded-full bg-purple-600 opacity-[0.15] blur-3xl animate-[drift_11s_ease-in-out_infinite] pointer-events-none" />

      <div className="relative max-w-2xl space-y-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-1">Settings</h2>
          <p className="text-slate-400">Personalize your default email preferences.</p>
        </div>

        

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-400" /> Profile
          </h3>
          <label className="label-text">Display Name</label>
          <input className="input-field" placeholder="Your name" value={prefs.name} onChange={update('name')} />
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <SettingsIcon size={18} className="text-blue-400" /> Default Preferences
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Default Tone</label>
              <select className="input-field" value={prefs.tone} onChange={update('tone')}>
                {['Formal', 'Polite', 'Assertive', 'Persuasive', 'Neutral'].map((t) => <option key={t} className="bg-[#161C2E]">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Default Language</label>
              <select className="input-field" value={prefs.language} onChange={update('language')}>
                {['English', 'Hindi'].map((l) => <option key={l} className="bg-[#161C2E]">{l}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-primary mt-5" onClick={handleSave}>
            {saved ? <Check size={16} /> : null}
            {saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={18} className="text-blue-400" /> Data
          </h3>
          <p className="text-sm text-slate-400">
            Your generated emails are stored in your Firestore project under the
            <code className="mx-1 px-1.5 py-0.5 bg-white/10 rounded font-mono text-xs">history</code>
            collection. Delete entries anytime from the History page.
          </p>
        </Card>

        {user && (
          <Card className="relative overflow-hidden border-red-500/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
            <h3 className="font-display font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Trash2 size={18} /> Account Actions
            </h3>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 justify-center rounded-xl border border-white/10 text-white font-medium px-5 py-2.5 hover:bg-white/5 transition-colors mb-3"
            >
              <LogOut size={16} /> Logout
            </button>
            {deleteError && <p className="text-sm text-red-400 mb-2">{deleteError}</p>}
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full flex items-center gap-2 justify-center rounded-xl bg-red-600 text-white font-medium px-5 py-2.5 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting…' : confirmDelete ? 'Click again to permanently delete' : 'Delete Account'}
            </button>
            {confirmDelete && !deleting && (
              <p className="text-xs text-red-400 mt-2 text-center">This will permanently delete your account and all your data. This cannot be undone.</p>
            )}
          </Card>
        )}

        <div className="flex items-start gap-2 text-xs text-slate-400">
          <Info size={14} className="mt-0.5 shrink-0" />
          Your name and default tone/language are saved in this browser and used automatically on the Generate Email page.
        </div>
      </div>
    </div>
  )
}