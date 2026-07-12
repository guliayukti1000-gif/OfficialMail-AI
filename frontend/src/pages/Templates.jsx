import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutTemplate, ArrowRight, Plus, X } from 'lucide-react'
import { Card, Spinner } from '../components/UI'
import { getTemplates, createTemplate } from '../api'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ title: '', category: '', content: '' })
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    getTemplates()
      .then(setTemplates)
      .catch(() =>
        setError('Could not load templates. Make sure the backend and Firebase are configured.')
      )
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const useTemplate = (tpl) => {
    sessionStorage.setItem('templateContent', tpl.content)
    navigate('/generate')
  }

  const handleSave = async () => {
    if (!newTemplate.title || !newTemplate.content) return
    setSaving(true)
    try {
      await createTemplate(newTemplate)
      setNewTemplate({ title: '', category: '', content: '' })
      setShowForm(false)
      load()
    } catch (e) {
      setError('Could not save the template.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">Templates</h2>
          <p className="text-ink-500">Ready-made starting points for common official emails.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Template'}
        </button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Create a Template</h3>
          <div className="space-y-3">
            <input
              className="input-field"
              placeholder="Title (e.g. Fee Refund Request)"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate((t) => ({ ...t, title: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Category (e.g. Academic)"
              value={newTemplate.category}
              onChange={(e) => setNewTemplate((t) => ({ ...t, category: e.target.value }))}
            />
            <textarea
              className="input-field min-h-[120px]"
              placeholder="Template content..."
              value={newTemplate.content}
              onChange={(e) => setNewTemplate((t) => ({ ...t, content: e.target.value }))}
            />
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner /> : <Plus size={16} />}
              {saving ? 'Saving…' : 'Save Template'}
            </button>
          </div>
        </Card>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-ink-500 text-sm">
          <Spinner className="border-brand-300 border-t-brand-600" /> Loading templates…
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
              <LayoutTemplate size={18} className="text-brand-500" />
            </div>
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide">{tpl.category}</p>
            <h3 className="font-display font-semibold text-ink-900 mt-1">{tpl.title}</h3>
            <p className="text-sm text-ink-500 mt-2 line-clamp-3">{tpl.content}</p>
            <button
              onClick={() => useTemplate(tpl)}
              className="mt-4 text-sm font-medium text-brand-600 flex items-center gap-1 hover:gap-2 transition-all"
            >
              Use this template <ArrowRight size={14} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}