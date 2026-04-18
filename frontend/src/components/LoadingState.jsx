import { useState, useEffect } from 'react'

const MESSAGES = [
  "Classifying incoming email stream...",
  "Extracting deadlines and eligibility...",
  "Running deterministic scoring engine...",
  "Comparing requirements against your profile...",
  "Building personalized career roadmap...",
  "Generating evidence-backed ranking...",
  "Finalizing action checklists..."
]

export default function LoadingState({ emailCount = 0 }) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const itv = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(itv)
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md w-full animate-fade-in">
        <div className="relative inline-block">
          <div className="font-bold text-8xl md:text-[140px] tracking-tighter text-accent/5 select-none leading-none">
            {emailCount || '00'}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-[6px] border-slate-50 border-t-accent rounded-full animate-spin shadow-sm" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-t1 tracking-tight">Processing {emailCount} Emails</h3>
            <p className="text-t3 text-xs font-medium uppercase tracking-widest">InboxPilot Engine v1.0.4</p>
          </div>
          
          <div className="h-10 flex items-center justify-center">
            <p className="text-sm font-bold text-accent animate-pulse tracking-tight">
              {MESSAGES[msgIndex]}
            </p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
           <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
           <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" />
        </div>
      </div>
    </div>
  )
}
