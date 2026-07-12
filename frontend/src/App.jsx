import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import FloatingAssistant from './components/FloatingAssistant'
import Home from './pages/Home'
import GenerateEmail from './pages/GenerateEmail'
import InboxSummary from './pages/InboxSummary'
import Templates from './pages/Templates'
import History from './pages/History'
import Settings from './pages/Settings'

const TITLES = {
  '/': ['Home', 'Welcome back — draft your next email in seconds.'],
  '/generate': ['Generate Email', 'Turn key points into a polished, professional email.'],
  '/inbox-summary': ['Inbox Summary', 'Paste an email to extract what matters.'],
  '/templates': ['Templates', 'Ready-made starting points for common emails.'],
  '/history': ['History', 'Everything you generated, saved automatically.'],
  '/settings': ['Settings', 'Manage your defaults and preferences.'],
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const [title, subtitle] = TITLES[location.pathname] || TITLES['/']

  return (
    <div className="flex min-h-screen bg-surface-soft">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <Navbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-5 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<GenerateEmail />} />
            <Route path="/inbox-summary" element={<InboxSummary />} />
            <Route path="/templates"element={<Templates />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <FloatingAssistant />
    </div>
  )
}