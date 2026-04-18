const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function analyzeEmails(raw_emails, profile) {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_emails, profile }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Server error ${res.status}`)
  }
  return res.json()
}

export async function getSampleEmails() {
  const res = await fetch(`${BASE}/sample-emails`)
  return res.json()
}
