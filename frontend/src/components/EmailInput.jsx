import { useState } from 'react'
import { getSampleEmails } from '../api'

export default function EmailInput({ value, onChange }) {
  const [loading, setLoading] = useState(false)

  async function loadSample() {
    setLoading(true)
    try { const data = await getSampleEmails(); onChange(data.raw) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-t1 uppercase tracking-tight">Email Content</label>
      </div>

      <div className="relative group">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={14}
          spellCheck={false}
          className="w-full bg-slate-50 border border-border rounded-2xl p-6 text-sm font-mono
                     focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all
                     placeholder:text-t3 leading-relaxed"
          placeholder={"Subject: Google STEP Internship...\n\n---\n\nSubject: HEC Scholarship..."}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-t3 uppercase">Live Parser</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] text-t3 font-bold uppercase">
          {value.split('---').filter(x => x.length > 20).length} Emails Detected
        </p>
        {value && (
          <button onClick={() => onChange('')} className="text-[10px] font-bold text-t3 uppercase hover:text-red-500 transition-colors">
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}
