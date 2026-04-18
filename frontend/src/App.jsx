import { useState } from 'react'
import EmailInput from './components/EmailInput'
import ProfileForm from './components/ProfileForm'
import ResultsDashboard from './components/ResultsDashboard'
import LoadingState from './components/LoadingState'
import { analyzeEmails } from './api'

export default function App() {
  const [emails,  setEmails]  = useState('')
  const [profile, setProfile] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleAnalyze() {
    if (!emails.trim()) { setError('Please paste your emails first.'); return }
    if (!profile?.degree) { setError('Please select your degree.'); return }
    setError('')
    setLoading(true)
    try {
      const data = await analyzeEmails(emails, profile)
      setResults(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    const count = emails.includes('---') 
      ? emails.split(/\n-{3,}\n/).length 
      : (emails.match(/\n(?=Subject:)/gi) || []).length + 1;
    return <LoadingState emailCount={count} />
  }

  if (results) {
    return <ResultsDashboard results={results} onBack={() => setResults(null)} />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold text-xl tracking-tight italic">InboxPilot</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-t1 tracking-tight">
            Your Inbox, <span className="text-accent">Structured.</span> Career opportunities prioritized by AI.
          </h1>
          <p className="text-t2 max-w-xl mx-auto text-sm leading-relaxed">
            Identify real opportunities, extract key details, and build your personalized 
            application roadmap instantly.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Email Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-1">
              <EmailInput value={emails} onChange={setEmails} />
            </div>
          </div>

          {/* Right: Profile Setup */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
              <ProfileForm onChange={setProfile} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 
                         hover:bg-accent/90 hover:-translate-y-0.5 transition-all active:scale-[0.98]
                         disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
            >
              Analyze & Build Roadmap →
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-t3 text-xs tracking-wide uppercase">
          Powered by Groq Cloud · llama-3.3-70b-versatile
        </div>
      </footer>
    </div>
  )
}
