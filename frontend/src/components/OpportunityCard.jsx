import { useState } from 'react'

export default function OpportunityCard({ opp, gap }) {
  const [open, setOpen] = useState(false)
  const days = opp.days_left ?? 999
  
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group animate-slide-up">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center font-bold text-accent text-xl">
            {opp.rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h2 className="text-base font-bold text-t1 leading-tight">{opp.title}</h2>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                days <= 7 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-t2 border-border'
              }`}>
                {days === 0 ? 'DEADLINE TODAY' : days < 999 ? `${days}d left` : 'Ongoing'}
              </span>
            </div>
            <p className="text-xs text-t3 font-medium flex items-center gap-2">
              <span className="text-t2 font-bold">{opp.org_name}</span>
              <span>•</span>
              <span className="uppercase tracking-tighter">{opp.type}</span>
              {opp.is_paid && (
                <>
                  <span>•</span>
                  <span className="text-green-600 font-bold px-1.5 py-0.5 bg-green-50 rounded text-[9px] border border-green-100 uppercase tracking-widest">Paid</span>
                </>
              )}
            </p>
          </div>

          <div className="text-right">
             <div className="flex items-center justify-end gap-1 mb-1">
              <span className="text-[8px] bg-green-50 text-green-600 border border-green-100 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                Evidence Backed
              </span>
            </div>
            <div className="text-2xl font-bold text-t1 leading-none">{opp.score}</div>
            <div className="text-[10px] font-bold text-t3 uppercase tracking-tighter mt-1">Match Score</div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 score-track">
            <div className="score-fill" style={{ width: `${Math.min((opp.score / 130) * 100, 100)}%` }} />
          </div>
          <button 
            onClick={() => setOpen(!open)}
            className="px-4 py-2 border border-border rounded-lg text-[10px] font-bold text-t1 uppercase tracking-widest flex items-center gap-1.5 hover:bg-surface transition-colors"
          >
            {open ? 'Hide Analysis' : 'Show Roadmap'}
            <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Roadmap Content */}
      {open && (
        <div className="bg-slate-50 border-t border-border p-6 space-y-8 animate-fade-in">
          {/* Scoring */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-[10px] font-bold text-t3 uppercase tracking-widest">Ranking Logic & Evidence</h4>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {(opp.score_reasons || []).map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[11px] text-t2">
                  <span className={`mt-0.5 font-bold ${r.includes('[-') ? 'text-red-500' : 'text-green-600'}`}>
                    {r.includes('[-') ? '▼' : '▲'}
                  </span>
                  <span className="leading-relaxed font-medium">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-[10px] font-bold text-t3 uppercase tracking-widest mb-3">Extracted Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {opp.skills_required?.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-white border border-border rounded text-[10px] font-bold text-t2">{s}</span>
                )) || <span className="text-[10px] text-t3">None specified</span>}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-t3 uppercase tracking-widest mb-3">Document Requirements</h4>
              <div className="flex flex-wrap gap-1.5">
                {opp.docs_required?.map(d => (
                  <span key={d} className="px-2 py-0.5 bg-white border border-border rounded text-[10px] font-bold text-t2">{d}</span>
                )) || <span className="text-[10px] text-t3">None specified</span>}
              </div>
            </div>
          </div>

          {/* Gap Analysis */}
          {gap && (
            <div className="bg-white border border-border shadow-sm rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                   <h4 className="text-xs font-bold text-t1 uppercase tracking-tight">AI-Generated Roadmap</h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border ${
                  gap.is_eligible_now ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {gap.is_eligible_now ? 'Eligible Now' : 'Preparation Required'}
                </span>
              </div>

              <div className="space-y-5">
                {gap.gap_plan?.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                      {i + 1}
                    </div>
                    <div>
                      {step.resource_link ? (
                        <a href={step.resource_link} target="_blank" rel="noreferrer" className="text-xs font-bold text-accent hover:underline leading-snug">
                          {step.action} ↗
                        </a>
                      ) : (
                        <p className="text-xs font-bold text-t1 leading-snug">{step.action}</p>
                      )}
                      <p className="text-[10px] text-t3 mt-1 font-medium italic">{step.deadline_suggestion} • {step.resource}</p>
                    </div>
                  </div>
                ))}
              </div>

              {gap.action_checklist?.length > 0 && (
                <div className="pt-5 border-t border-border">
                  <h5 className="text-[10px] font-bold text-t3 uppercase mb-4 tracking-widest">Immediate Submission Checklist</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gap.action_checklist.map((item, i) => (
                      <label key={i} className="flex items-center gap-3 text-[11px] text-t2 cursor-pointer group p-2 rounded-lg hover:bg-surface transition-colors border border-transparent hover:border-border">
                        <input type="checkbox" className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />
                        <span className="group-hover:text-t1 transition-colors leading-tight font-medium">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {opp.link && (
            <a href={opp.link} target="_blank" rel="noreferrer"
               className="block w-full py-4 bg-accent text-white text-center text-sm font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
              Apply via Official Portal →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
