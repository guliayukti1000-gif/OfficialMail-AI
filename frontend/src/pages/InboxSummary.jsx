import { useState } from 'react'
import { Inbox, CalendarDays, Users, Clock4, ListChecks, ScanSearch } from 'lucide-react'
import { Card, Spinner, PriorityBadge } from '../components/UI'
import { summarizeInbox } from '../api'

function ListSection({ icon: Icon, title, items }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">
        <Icon size={14} /> {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-ink-900 bg-surface-muted rounded-lg px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function InboxSummary() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Paste an email to summarize first.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await summarizeInbox(text)
      setResult(data)
    } catch (e) {
      setError('Could not summarize this email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-6xl">
      <Card>
        <h2 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <Inbox size={18} className="text-brand-500" /> Paste Email
        </h2>
        <textarea
          className="w-full min-h-[320px] resize-y input-field text-sm leading-relaxed"
          placeholder="Paste the full email you received here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <button className="btn-primary mt-4" onClick={handleSummarize} disabled={loading}>
          {loading ? <Spinner /> : <ScanSearch size={16} />}
          {loading ? 'Analyzing…' : 'Summarize Email'}
        </button>
      </Card>

      <Card>
        {result ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-ink-900">Summary</h3>
              <PriorityBadge priority={result.priority} />
            </div>
            <p className="text-sm text-ink-700 leading-relaxed">{result.summary}</p>

            <ListSection icon={CalendarDays} title="Important Dates" items={result.important_dates} />
            <ListSection icon={Users} title="Important People" items={result.important_people} />
            <ListSection icon={Clock4} title="Deadlines" items={result.deadlines} />
            <ListSection icon={ListChecks} title="Action Items" items={result.action_items} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 border-dashed border rounded-xl border-ink-300/50">
            <ScanSearch size={28} className="text-ink-300 mb-3" />
            <p className="text-sm text-ink-500 max-w-xs">
              The summary, deadlines, and action items will appear here.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
