import OpportunityCard from './OpportunityCard'

export default function ResultsDashboard({ results, onBack }) {
  const { opportunities = [], filtered_out = [], gap_analysis = [] } = results

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-t3 hover:text-t1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold text-t1 tracking-tight">Your Priority Roadmap</h1>
              <p className="text-[10px] font-bold text-t3 uppercase tracking-widest mt-0.5">
                {opportunities.length} Opportunities Identified
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <div className="text-right">
               <p className="text-[10px] font-bold text-t3 uppercase tracking-widest">Top Match Score</p>
               <p className="text-sm font-bold text-accent">{opportunities[0]?.score || 0} pts</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {opportunities.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl px-8 py-20 text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-t1">No opportunities found</h3>
            <p className="text-sm text-t3 max-w-xs mx-auto">Try adding more emails or broadening your profile interests.</p>
            <button onClick={onBack} className="btn-primary mt-4">Edit Profile</button>
          </div>
        ) : (
          <div className="space-y-8">
            {opportunities.map((opp, i) => (
              <div key={i} className="relative">
                {i === 0 && (
                  <div className="absolute -top-3 left-6 z-10 px-3 py-1 bg-accent text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg animate-bounce">
                    Top Recommendation
                  </div>
                )}
                <OpportunityCard
                  opp={opp}
                  gap={gap_analysis.find(g => g.rank === opp.rank)}
                />
              </div>
            ))}
          </div>
        )}

        {filtered_out.length > 0 && (
          <div className="pt-8 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3 mb-6 px-2">
               <h4 className="text-[10px] font-bold text-t3 uppercase tracking-widest">Noise Filtered (Spam/Irrelevant)</h4>
               <div className="h-px flex-1 bg-border" />
            </div>
            <div className="bg-white border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {filtered_out.map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-t2">{item.title || `Email ${item.email_index}`}</p>
                    <p className="text-[10px] text-t3 font-medium mt-0.5 uppercase tracking-tighter italic">Auto-filtered content</p>
                  </div>
                  <span className="text-[10px] font-bold text-t3 uppercase tracking-tighter bg-slate-100 px-3 py-1.5 rounded-lg border border-border/50">
                    {item.why_not_opportunity || 'Non-Career Content'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
