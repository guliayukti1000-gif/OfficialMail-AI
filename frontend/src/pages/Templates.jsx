import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutTemplate, ArrowRight, Plus, X, Pencil, Trash2, Check, Search } from 'lucide-react'
import { Card, Spinner } from '../components/UI'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api'
import { useAuth } from '../hooks/useAuth'

const COLOR_OPTIONS = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Cyan', value: '#06B6D4' },
]

const EMPTY_FORM = { title: '', category: '', content: '', color: COLOR_OPTIONS[0].value }

function TemplateCard({ tpl, isDefault, onUse, onEdit, onDelete }) {
  return (
    <Card
      className="relative flex flex-col overflow-hidden"
      style={!isDefault && tpl.color ? { borderTop: `3px solid ${tpl.color}` } : undefined}
    >
      {isDefault && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={!isDefault && tpl.color ? { backgroundColor: `${tpl.color}20` } : undefined}
        >
          <LayoutTemplate
            size={18}
            style={!isDefault && tpl.color ? { color: tpl.color } : undefined}
            className={!isDefault && tpl.color ? '' : 'text-blue-400'}
          />
        </div>
        {!isDefault && (
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(tpl)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(tpl.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={!isDefault && tpl.color ? { color: tpl.color } : undefined}
      >
        {!isDefault && tpl.color ? tpl.category : <span className="text-blue-400">{tpl.category}</span>}
      </p>
      <h3 className="font-display font-semibold text-white mt-1">{tpl.title}</h3>
      <p className="text-sm text-slate-400 mt-2 line-clamp-3">{tpl.content}</p>
      <button
        onClick={() => onUse(tpl)}
        className="mt-4 text-sm font-medium text-blue-400 flex items-center gap-1 hover:gap-2 transition-all"
      >
        Use this template <ArrowRight size={14} />
      </button>
    </Card>
  )
}

export default function Templates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all') // 'all' | 'default' | 'custom'
  const navigate = useNavigate()

  const load = () => {
    if (!user) return
    setLoading(true)
    getTemplates(user.uid)
      .then(setTemplates)
      .catch(() =>
        setError('Could not load templates. Make sure the backend and Firebase are configured.')
      )
      .finally(() => setLoading(false))
  }

  useEffect(load, [user])

  const useTemplate = (tpl) => {
    sessionStorage.setItem('templateContent', tpl.content)
    navigate('/generate')
  }

  const startEdit = (tpl) => {
    setForm({ title: tpl.title, category: tpl.category, content: tpl.content, color: tpl.color || COLOR_OPTIONS[0].value })
    setEditingId(tpl.id)
    setShowForm(true)
  }

  const startNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm((s) => !s)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return
    setSaving(true)
    try {
      if (editingId) {
        await updateTemplate(editingId, { ...form, user_id: user.uid })
      } else {
        await createTemplate({ ...form, user_id: user.uid })
      }
      setForm(EMPTY_FORM)
      setEditingId(null)
      setShowForm(false)
      load()
    } catch (e) {
      setError('Could not save the template.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteTemplate(id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const isDefaultTemplate = (t) => t.is_default || !t.user_id
  const matchesSearch = (t) => {
    const q = search.toLowerCase()
    return !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)
  }
  const filtered = templates.filter(matchesSearch)
  const defaultTemplates = filtered.filter(isDefaultTemplate)
  const customTemplates = filtered.filter((t) => !isDefaultTemplate(t))
  const showDefault = tab === 'all' || tab === 'default'
  const showCustom = tab === 'all' || tab === 'custom'

  return (
    <div className="relative">
      <div className="absolute top-[-100px] left-[10%] w-72 h-72 rounded-full bg-blue-500 opacity-[0.15] blur-3xl animate-[drift_9s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[5%] w-80 h-80 rounded-full bg-purple-600 opacity-[0.15] blur-3xl animate-[drift_11s_ease-in-out_infinite] pointer-events-none" />

      <div className="relative max-w-5xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">Templates</h2>
            <p className="text-slate-400">Ready-made starting points for common official emails.</p>
          </div>
          <button className="btn-primary" onClick={startNew}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'New Template'}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'default', label: 'Default' },
              { key: 'custom', label: 'Yours' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-white/10 text-blue-400' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-field pl-9 !py-2"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {showForm && (
          <Card className="mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
            <h3 className="font-display font-semibold text-white mb-4">
              {editingId ? 'Edit Template' : 'Create a Template'}
            </h3>
            <div className="space-y-3">
              <input
                className="input-field"
                placeholder="Title (e.g. Fee Refund Request)"
                value={form.title}
                onChange={(e) => setForm((t) => ({ ...t, title: e.target.value }))}
              />
              <input
                className="input-field"
                placeholder="Category (e.g. Academic)"
                value={form.category}
                onChange={(e) => setForm((t) => ({ ...t, category: e.target.value }))}
              />
              <textarea
                className="input-field min-h-[120px]"
                placeholder="Template content..."
                value={form.content}
                onChange={(e) => setForm((t) => ({ ...t, content: e.target.value }))}
              />
              <div>
                <label className="label-text">Card Color</label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm((t) => ({ ...t, color: c.value }))}
                      title={c.name}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        form.color === c.value ? 'ring-2 ring-offset-2 ring-offset-[#161C2E] ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner /> : editingId ? <Check size={16} /> : <Plus size={16} />}
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Save Template'}
              </button>
            </div>
          </Card>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Spinner className="border-white/20 border-t-white" /> Loading templates…
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && showDefault && defaultTemplates.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Default Templates</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {defaultTemplates.map((tpl) => (
                <TemplateCard key={tpl.id} tpl={tpl} isDefault onUse={useTemplate} />
              ))}
            </div>
          </div>
        )}

        {!loading && showCustom && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Your Templates</h3>
            {customTemplates.length === 0 ? (
              <Card className="text-center py-12 border-dashed border-white/10">
                <p className="text-sm text-slate-400">You haven't created any templates yet.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {customTemplates.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    isDefault={false}
                    onUse={useTemplate}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}