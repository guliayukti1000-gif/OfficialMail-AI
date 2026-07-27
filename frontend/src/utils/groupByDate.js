const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

function getDateLabel(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfToday - startOfDate) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 7) return 'This Week'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

// Groups items by friendly date label, sorting each group by priority
// (if present) then by most recent first.
export function groupByDate(items, dateKey = 'created_at', priorityKey = 'priority') {
  const groups = {}
  for (const item of items) {
    const label = getDateLabel(item[dateKey])
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  }

  for (const label in groups) {
    groups[label].sort((a, b) => {
      const pa = PRIORITY_ORDER[a[priorityKey]] ?? 3
      const pb = PRIORITY_ORDER[b[priorityKey]] ?? 3
      if (pa !== pb) return pa - pb
      return new Date(b[dateKey]) - new Date(a[dateKey])
    })
  }

  const labelOrder = ['Today', 'Yesterday', 'This Week']
  const sortedLabels = Object.keys(groups).sort((a, b) => {
    const ia = labelOrder.indexOf(a)
    const ib = labelOrder.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return new Date(groups[b][0][dateKey]) - new Date(groups[a][0][dateKey])
  })

  return sortedLabels.map((label) => ({ label, items: groups[label] }))
}