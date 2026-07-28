import { useEffect, useState } from 'react'
import { History as HistoryIcon, Trash2, Clock } from 'lucide-react'
import { Card, Spinner, PriorityBadge } from '../components/UI'
import { getHistory, deleteHistory, getSummaries, deleteSummary } from '../api'
import { useAuth } from '../hooks/useAuth'
import { groupByDate } from '../utils/groupByDate'

const SORT_OPTIONS = ['Newest first', 'Oldest first', 'Priority']

export default function History() {
  const { user } = useAuth()
  const [tab, setTab] = useState('emails') // 'emails' | 'summaries'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('Newest first')

  const load = () => {
    if (!user) return
    setLoading(true)
    const fetcher = tab === 'emails' ? getHistory(user.uid) : getSummaries(user.uid)
    fetcher
      .then(setItems)
      .catch(() => setError('Could not load history. Check your Firebase configuration.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [user, tab])

  const handleDelete = async (id) => {
    if (tab === 'emails') {
      await deleteHistory(id)
    } else {
      await deleteSummary(id)
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const sortedItems = [...items]
  if (sortBy === 'Oldest first') {
    sortedItems.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else if (sortBy === 'Newest first') {
    sortedItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  const groups = groupByDate(sortedItems)

  return (
    <div className="relative">
      <div className="absolute top-[-100px] left-[10%] w-72 h-72 rounded-full bg-blue-500 opacity-[0.15] blur-3xl animate-[drift_9s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[5%] w-80 h-80 rounded-full bg-purple-600 opacity-[0.15] blur-3xl animate-[drift_11s_ease-in-out_infinite] pointer-events-none" />

      <div className="relative max-w-4xl">
        <h2 className="font-display font-bold text-2xl text-white mb-1">History</h2>
        <p className="text-slate-400 mb-5">Everything you've generated and analyzed, saved automatically.</p>

        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('emails')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'emails' ? 'bg-white/10 text-blue-400' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              Generated Emails
            </button>
            <button
              onClick={() => setTab('summaries')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'summaries' ? 'bg-white/10 text-blue-400' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              Inbox Summaries
            </button>
          </div>

          <select
            className="input-field !w-auto text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => <option key={opt} className="bg-[#161C2E]">{opt}</option>)}
          </select>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Spinner className="border-white/20 border-t-white" /> Loading history…
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && items.length === 0 && !error && (
          <Card className="text-center py-16 border-dashed border-white/10">
            <HistoryIcon size={26} className="text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              {tab === 'emails' ? 'No emails generated yet.' : 'No summaries available.'}
            </p>
          </Card>
        )}

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{group.label}</h4>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <Card key={item.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate">
                          {tab === 'emails' ? item.subject : item.summary?.slice(0, 60) + '...'}
                        </h3>
                        {tab === 'summaries' && item.priority && <PriorityBadge priority={item.priority} />}
                      </div>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {tab === 'emails' ? item.body : item.email_text}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-500 mt-2 font-mono">
                        <Clock size={12} />
                        {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 shrink-0"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}