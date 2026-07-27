import { useState, useEffect } from 'react'
import {
  Wand2, Copy, FileDown, FileText, Check, Sparkles,
  Smile, Expand, Shrink, SpellCheck, RefreshCw, Languages, Tag,
} from 'lucide-react'
import { Card, Spinner } from '../components/UI'
import { generateEmail, aiProcess, exportEmail, saveHistory } from '../api'
import { useAuth } from '../hooks/useAuth'
import useSessionState from '../hooks/useSessionState'

const TONES = ['Formal', 'Polite', 'Assertive', 'Persuasive', 'Neutral']
const LANGUAGES = ['English', 'Hindi']
const LENGTHS = ['Short', 'Medium', 'Long']

const editTools = [
  { action: 'make_formal', label: 'More Formal', icon: Wand2 },
  { action: 'make_friendly', label: 'Friendlier', icon: Smile },
  { action: 'expand', label: 'Expand', icon: Expand },
  { action: 'shorten', label: 'Shorten', icon: Shrink },
  { action: 'improve_grammar', label: 'Fix Grammar', icon: SpellCheck },
  { action: 'rewrite', label: 'Rewrite', icon: RefreshCw },
]

export default function GenerateEmail() {
  const { user } = useAuth()
  const [form, setForm] = useSessionState('generateEmail_form', {
    purpose: '',
    recipient_name: '',
    recipient_designation: '',
    organization: '',
    key_points: '',
    tone: 'Formal',
    language: 'English',
    length: 'Medium',
  })
  const [email, setEmail] = useSessionState('generateEmail_result', null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null) // which tool is running
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('templateContent')
    if (saved) {
      setForm((f) => ({ ...f, key_points: saved }))
      sessionStorage.removeItem('templateContent')
    }
  }, [])
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const fullBody = () =>
    email ? `${email.greeting}\n\n${email.body}\n\n${email.closing}\n${email.signature}` : ''

  const handleGenerate = async () => {
    setError('')
    if (!form.purpose || !form.recipient_name || !form.key_points) {
      setError('Please fill in purpose, recipient name, and key points.')
      return
    }
    setLoading(true)
    try {
      const result = await generateEmail(form)
      setEmail(result)
      saveHistory({
        subject: result.subject,
        body: `${result.greeting}\n\n${result.body}\n\n${result.closing}\n${result.signature}`,
        purpose: form.purpose,
        user_id: user?.uid || 'guest',
      }).catch(() => {})
    } catch (e) {
      setError(e?.response?.data?.detail || 'Something went wrong while generating the email.')
    } finally {
      setLoading(false)
    }
  }

  const runEditTool = async (action) => {
    if (!email) return
    setEditing(action)
    try {
      const result = await aiProcess(action, email.body)
      setEmail((prev) => ({ ...prev, body: result.result }))
    } catch (e) {
      setError('That edit could not be completed. Please try again.')
    } finally {
      setEditing(null)
    }
  }

  const runSuggestSubject = async () => {
    if (!email) return
    setEditing('suggest_subject')
    try {
      const result = await aiProcess('suggest_subject', email.body)
      setEmail((prev) => ({ ...prev, subject: result.result.replace(/^["']|["']$/g, '') }))
    } finally {
      setEditing(null)
    }
  }

  const runTranslate = async (target) => {
    if (!email) return
    setEditing('translate')
    try {
      const result = await aiProcess('translate', email.body, target)
      setEmail((prev) => ({ ...prev, body: result.result }))
    } finally {
      setEditing(null)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(fullBody())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-6 max-w-6xl">
      {/* Form */}
      <Card className="h-fit">
        <h2 className="font-display font-semibold text-ink-900 mb-5 flex items-center gap-2">
          <Sparkles size={18} className="text-brand-500" /> Email Details
        </h2>

        <div className="space-y-4">
          <div>
            <label className="label-text">Purpose</label>
            <input
              className="input-field"
              placeholder="e.g. Requesting leave for a family event"
              value={form.purpose}
              onChange={update('purpose')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Recipient Name</label>
              <input className="input-field" value={form.recipient_name} onChange={update('recipient_name')} placeholder="Mr. Sharma" />
            </div>
            <div>
              <label className="label-text">Designation</label>
              <input className="input-field" value={form.recipient_designation} onChange={update('recipient_designation')} placeholder="HR Manager" />
            </div>
          </div>

          <div>
            <label className="label-text">Organization</label>
            <input className="input-field" value={form.organization} onChange={update('organization')} placeholder="Acme Pvt. Ltd." />
          </div>

          <div>
            <label className="label-text">Key Points</label>
            <textarea
              className="input-field min-h-[100px] resize-y"
              placeholder="List the main things this email must cover..."
              value={form.key_points}
              onChange={update('key_points')}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-text">Tone</label>
              <select className="input-field" value={form.tone} onChange={update('tone')}>
                {TONES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Language</label>
              <select className="input-field" value={form.language} onChange={update('language')}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Length</label>
              <select className="input-field" value={form.length} onChange={update('length')}>
                {LENGTHS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn-primary w-full" onClick={handleGenerate} disabled={loading}>
            {loading ? <Spinner /> : <Wand2 size={16} />}
            {loading ? 'Generating…' : 'Generate Email'}
          </button>
        </div>
      </Card>

      {/* Output */}
      <div className="space-y-4">
        {email ? (
          <>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-900" />
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <label className="label-text">Subject</label>
                  <input
                    className="input-field font-medium"
                    value={email.subject}
                    onChange={(e) => setEmail((p) => ({ ...p, subject: e.target.value }))}
                  />
                </div>
              </div>
              <textarea
                className="w-full min-h-[280px] resize-y text-sm leading-relaxed text-ink-900 border border-ink-300/60 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                value={fullBody()}
                onChange={(e) => {
                  // keep it simple: treat the whole textarea as the editable body
                  setEmail((p) => ({ ...p, greeting: '', body: e.target.value, closing: '', signature: '' }))
                }}
              />

              <div className="flex flex-wrap gap-3 mt-4">
                <button className="btn-secondary" onClick={handleCopy}>
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy to Clipboard'}
                </button>
                <button className="btn-secondary" onClick={() => exportEmail(email.subject, fullBody(), 'pdf')}>
                  <FileDown size={16} /> Download PDF
                </button>
                <button className="btn-secondary" onClick={() => exportEmail(email.subject, fullBody(), 'docx')}>
                  <FileText size={16} /> Download DOCX
                </button>
              </div>
            </Card>

            <Card>
              <h3 className="font-display font-semibold text-ink-900 mb-4 text-sm">AI Editing Tools</h3>
              <div className="flex flex-wrap gap-2">
                {editTools.map(({ action, label, icon: Icon }) => (
                  <button
                    key={action}
                    onClick={() => runEditTool(action)}
                    disabled={editing !== null}
                    className="btn-secondary text-xs py-2 px-3.5"
                  >
                    {editing === action ? <Spinner className="border-brand-300 border-t-brand-600" /> : <Icon size={14} />}
                    {label}
                  </button>
                ))}
                <button onClick={runSuggestSubject} disabled={editing !== null} className="btn-secondary text-xs py-2 px-3.5">
                  {editing === 'suggest_subject' ? <Spinner className="border-brand-300 border-t-brand-600" /> : <Tag size={14} />}
                  Suggest Subject
                </button>
                <button onClick={() => runTranslate(form.language === 'Hindi' ? 'English' : 'Hindi')} disabled={editing !== null} className="btn-secondary text-xs py-2 px-3.5">
                  {editing === 'translate' ? <Spinner className="border-brand-300 border-t-brand-600" /> : <Languages size={14} />}
                  Translate {form.language === 'Hindi' ? '→ English' : '→ Hindi'}
                </button>
              </div>
            </Card>
          </>
        ) : (
          <Card className="h-full flex flex-col items-center justify-center text-center py-24 border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Wand2 size={24} className="text-brand-500" />
            </div>
            <h3 className="font-display font-semibold text-ink-900">Your draft will appear here</h3>
            <p className="text-sm text-ink-500 mt-1 max-w-xs">
              Fill in the details on the left and generate a fully formatted, professional email.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
