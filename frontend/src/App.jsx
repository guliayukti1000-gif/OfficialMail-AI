import { useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import FloatingAssistant from './components/FloatingAssistant'
import Home from './pages/Home'
import GenerateEmail from './pages/GenerateEmail'
import InboxSummary from './pages/InboxSummary'
import Templates from './pages/Templates'
import History from './pages/History'
import Settings from './pages/Settings'
import BulkSend from "./pages/BulkSend"
import SpamChecker from "./pages/SpamChecker"
import Login from "./pages/Login"
import { useAuth } from './hooks/useAuth'
import AppIntro from "./pages/AppIntro"

const TITLES = {
  '/': ['Home', 'Welcome back — draft your next email in seconds.'],
  '/generate': ['Generate Email', 'Turn key points into a polished, professional email.'],
  '/inbox-summary': ['Inbox Summary', 'Paste an email to extract what matters.'],
  '/templates': ['Templates', 'Ready-made starting points for common emails.'],
  '/history': ['History', 'Everything you generated, saved automatically.'],
  '/settings': ['Settings', 'Manage your defaults and preferences.'],
  '/spam-checker': ['Spam Checker', 'Analyze your email for spam risk before sending.'],
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const [title, subtitle] = TITLES[location.pathname] || TITLES['/']

  return (
    <div className="flex min-h-screen bg-[#161C2E]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <Navbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-5 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<GenerateEmail />} />
            <Route path="/inbox-summary" element={<InboxSummary />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/bulk-send" element={<BulkSend />} />
            <Route path="/spam-checker" element={<SpamChecker />} />
          </Routes>
        </main>
      </div>
      <FloatingAssistant />
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A]">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/welcome" element={user ? <Navigate to="/" /> : <AppIntro />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/*" element={user ? <AppShell /> : <Navigate to="/welcome" />} />
    </Routes>
  )
}