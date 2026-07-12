import { useEffect, useState } from 'react'
import { History as HistoryIcon, Trash2, Clock } from 'lucide-react'
import { Card, Spinner } from '../components/UI'
import { getHistory, deleteHistory } from '../api'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getHistory()
      .then(setItems)
      .catch(() => setError('Could not load history. Check your Firebase configuration.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id) => {
    await deleteHistory(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="max-w-4xl">
      <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">History</h2>
      <p className="text-ink-500 mb-6">Every email you've generated, saved automatically.</p>

      {loading && (
        <div className="flex items-center gap-2 text-ink-500 text-sm">
          <Spinner className="border-brand-300 border-t-brand-600" /> Loading history…
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <Card className="text-center py-16 border-dashed">
          <HistoryIcon size={26} className="text-ink-300 mx-auto mb-3" />
          <p className="text-sm text-ink-500">No emails generated yet.</p>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-medium text-ink-900 truncate">{item.subject}</h3>
              <p className="text-sm text-ink-500 mt-1 line-clamp-2">{item.body}</p>
              <p className="flex items-center gap-1 text-xs text-ink-500 mt-2 font-mono">
                <Clock size={12} />
                {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
              </p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 rounded-lg text-ink-500 hover:text-red-600 hover:bg-red-50 shrink-0"
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
