import { useState } from 'react'
import { Inbox, CalendarDays, Users, Clock4, ListChecks, ScanSearch, Briefcase, Smile, Zap } from 'lucide-react'
import { Card, Spinner, PriorityBadge } from '../components/UI'
import { summarizeInbox, generateReplies, aiProcess, saveSummary } from '../api'
import { useAuth } from '../hooks/useAuth'
import useSessionState from '../hooks/useSessionState'

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

function ReplyLoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative w-40 h-24">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-brand-200/40 blur-2xl animate-pulse" />
        </div>
        <svg
          viewBox="0 0 200 120"
          className="absolute inset-0 w-full h-full animate-[float_3s_ease-in-out_infinite]"
        >
          <ellipse cx="70" cy="70" rx="38" ry="26" fill="#ffffff" opacity="0.95" />
          <ellipse cx="105" cy="55" rx="46" ry="32" fill="#ffffff" opacity="0.95" />
          <ellipse cx="140" cy="70" rx="34" ry="24" fill="#ffffff" opacity="0.95" />
          <ellipse cx="100" cy="82" rx="70" ry="22" fill="#ffffff" />
        </svg>
        <span className="absolute top-1 left-6 w-1.5 h-1.5 rounded-full bg-brand-300 animate-ping" />
        <span className="absolute top-4 right-8 w-1 h-1 rounded-full bg-brand-300 animate-ping [animation-delay:0.6s]" />
        <span className="absolute bottom-8 left-10 w-1 h-1 rounded-full bg-brand-300 animate-ping [animation-delay:1.2s]" />
      </div>
      <p className="text-sm text-ink-500 mt-2 animate-pulse">Dreaming up thoughtful replies…</p>
    </div>
  )
}
function WaveLoadingAnimation() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-20">
      <div className="flex items-end gap-1 h-10 mb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-brand-400 animate-[wave_1s_ease-in-out_infinite]"
            style={{ height: '100%', animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <p className="text-sm text-ink-500">Reading your email…</p>
    </div>
  )
}

const TONE_META = {
  Formal: { Icon: Briefcase, colorClass: 'bg-blue-100 text-blue-700' },
  Friendly: { Icon: Smile, colorClass: 'bg-orange-100 text-orange-700' },
  Concise: { Icon: Zap, colorClass: 'bg-violet-100 text-violet-700' },
}

function ReplyPanel({ replies, onUpdate }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showActions, setShowActions] = useState(false)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const active = replies[activeIndex]
  const meta = TONE_META[active.tone] || { icon: 'ti-mail', colorClass: 'c-gray' }

  const runAction = async (action, target_language) => {
    setBusy(true)
    try {
      const data = await aiProcess(action, active.reply, target_language)
      onUpdate(activeIndex, data.result)
    } catch (e) {
      // silently ignore, keep existing text
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(active.reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-2 w-28 flex-shrink-0">
        {replies.map((r, i) => {
          const m = TONE_META[r.tone] || { icon: 'ti-mail', colorClass: 'c-gray' }
          const isActive = i === activeIndex
          return (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); setShowActions(false) }}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-left transition-colors ${
                isActive ? m.colorClass : 'bg-surface-muted text-ink-500'
              }`}
            >
              <m.Icon size={15} />
              {r.tone}
            </button>
          )
        })}
      </div>
      <div className="flex-1 border-l border-ink-200/60 pl-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${meta.colorClass}`}>
          <meta.Icon size={13} />
            {active.tone}
          </span>
          <div className="flex items-center gap-3">
            <button className="text-xs text-ink-500 hover:text-brand-500" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="text-xs text-ink-500 hover:text-brand-500" onClick={() => setShowActions((s) => !s)}>
              {showActions ? 'Hide options' : 'Edit'}
            </button>
          </div>
        </div>
        <p className="text-sm text-ink-800 whitespace-pre-line leading-relaxed">
          {busy ? 'Updating…' : active.reply}
        </p>
        {showActions && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-ink-200/50">
            <button className="btn-secondary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => runAction('expand')}>Expand</button>
            <button className="btn-secondary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => runAction('shorten')}>Shorten</button>
            <button className="btn-secondary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => runAction('make_formal')}>Formal</button>
            <button className="btn-secondary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => runAction('make_friendly')}>Friendly</button>
            <button className="btn-secondary !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => runAction('translate', 'Hindi')}>Translate (Hindi)</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InboxSummary() {
  const { user } = useAuth()
  const [text, setText] = useSessionState('inboxSummary_text', '')
  const [result, setResult] = useSessionState('inboxSummary_result', null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [replies, setReplies] = useSessionState('inboxSummary_replies', null)
  const [repliesLoading, setRepliesLoading] = useState(false)

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Paste an email to summarize first.')
      return
    }
    setError('')
    setLoading(true)
    setReplies(null)
    try {
      const data = await summarizeInbox(text)
      setResult(data)
      saveSummary({
        email_text: text,
        summary: data.summary,
        important_dates: data.important_dates,
        important_people: data.important_people,
        deadlines: data.deadlines,
        action_items: data.action_items,
        priority: data.priority,
        user_id: user?.uid || 'guest',
      }).catch(() => {})
      setRepliesLoading(true)
      generateReplies(text)
        .then((r) => setReplies(r.replies))
        .catch(() => setReplies([]))
        .finally(() => setRepliesLoading(false))
    } catch (e) {
      setError('Could not summarize this email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateReply = (index, newText) => {
    setReplies((prev) => prev.map((r, i) => (i === index ? { ...r, reply: newText } : r)))
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

            <div className="pt-2 border-t border-ink-200/50">
              <h3 className="font-display font-semibold text-ink-900 mb-3">Suggested Replies</h3>
              {repliesLoading && <ReplyLoadingAnimation />}
              {!repliesLoading && replies && replies.length > 0 && (
                <ReplyPanel replies={replies} onUpdate={updateReply} />
              )}
            </div>
          </div>
        ) : loading ? (
          <WaveLoadingAnimation />
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