import { useState, useEffect } from 'react'

const DEGREES = [
  'BS Computer Science','BS Software Engineering','BS AI','BS Data Science',
  'BS Electrical Engineering','BS Cyber Security','BS Robotics','BBA','BS Fintech'
]
const SUGGESTED_SKILLS = ['Python','React','Java','C++','SQL','ML/AI','DSA','Node.js','Flutter','AWS','Docker']
const SUGGESTED_INTERESTS = ['Cybersecurity','Cloud Computing','Robotics','UX/UI Design','Blockchain','Open Source']
const TYPES = ['internship','scholarship','fellowship','competition','research','admission']

const GOALS = [
  {v:'research',l:'Academic Research'},{v:'industry',l:'Industry / Big Tech'},
  {v:'startup',l:'Startup / Founding'},{v:'abroad',l:'Study Abroad'}
]

export default function ProfileForm({ onChange }) {
  const [form, setForm] = useState({
    degree: '', semester: 4, cgpa: 3.0,
    skills: [], interests: [], preferred_types: ['internship'],
    financial_need: false, location_preference: 'any',
    future_goal: 'industry', documents_ready: ['cv'],
    past_experience: [],
    hours_available_per_week: 20,
  })
  
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [expInput, setExpInput] = useState('')

  useEffect(() => { onChange(form) }, [form])

  const labelCls = "block text-xs font-bold text-t1 mb-2 uppercase tracking-tight"

  function toggle(field, val) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
    }))
  }

  function addToList(field, val, setter) {
    const trimmed = val.trim()
    if (!trimmed) return
    if (!form[field].includes(trimmed)) {
      setForm(f => ({ ...f, [field]: [...f[field], trimmed] }))
    }
    setter('')
  }

  function removeFromList(field, index) {
    setForm(f => ({
      ...f,
      [field]: f[field].filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-8">
      {/* 1. Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelCls}>Field or Degree</label>
          <select 
            value={form.degree} 
            onChange={e => setForm(f => ({...f, degree: e.target.value}))}
            className="input-ghost py-4 text-base"
          >
            <option value="">Select your field…</option>
            {DEGREES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Career Goal</label>
          <select 
            value={form.future_goal} 
            onChange={e => setForm(f => ({...f, future_goal: e.target.value}))}
            className="input-ghost py-4 text-base"
          >
            {GOALS.map(g => <option key={g.v} value={g.v}>{g.l}</option>)}
          </select>
        </div>
      </div>

      {/* 2. Academics & Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelCls}>Current Level (CGPA)</label>
          <div className="relative group px-1">
            <input 
              type="range" min="2.0" max="4.0" step="0.1" value={form.cgpa}
              onChange={e => setForm(f => ({...f, cgpa: +e.target.value}))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-accent mt-3"
            />
            <div className="flex justify-between text-[10px] text-t3 font-bold mt-2">
              <span>2.0</span>
              <span className="text-accent text-sm">{form.cgpa.toFixed(1)}</span>
              <span>4.0</span>
            </div>
          </div>
        </div>
        <div>
          <label className={labelCls}>Target Semester</label>
          <select 
            value={form.semester} 
            onChange={e => setForm(f => ({...f, semester: +e.target.value}))}
            className="input-ghost py-4 text-base"
          >
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Location Preference</label>
          <select 
            value={form.location_preference} 
            onChange={e => setForm(f => ({...f, location_preference: e.target.value}))}
            className="input-ghost py-4 text-base"
          >
            <option value="any">Global Market</option>
            <option value="remote">Remote Only</option>
            <option value="local">Local Market</option>
          </select>
        </div>
      </div>

      {/* 3. Dynamic Skills */}
      <div>
        <label className={labelCls}>Key Skills</label>
        <div className="flex gap-2 mb-3">
          <input 
            type="text" value={skillInput} 
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('skills', skillInput, setSkillInput))}
            placeholder="e.g. C#, System Design, Figma..."
            className="input-ghost py-4 text-base"
          />
          <button onClick={() => addToList('skills', skillInput, setSkillInput)} className="btn-primary px-6">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.skills.map((s, i) => (
            <span key={i} className="chip-active flex items-center gap-1.5 px-3 py-1.5">
              {s}
              <button onClick={() => removeFromList('skills', i)} className="hover:text-red-200">✕</button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold text-t3 mr-2 self-center uppercase">Quick Add:</span>
          {SUGGESTED_SKILLS.map(s => (
            <button key={s} onClick={() => !form.skills.includes(s) && setForm(f => ({...f, skills: [...f.skills, s]}))}
              className="px-2 py-1 rounded-md bg-slate-50 border border-border text-[9px] font-bold text-t2 hover:border-accent hover:text-accent transition-colors">
              +{s}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Dynamic Interests */}
      <div>
        <label className={labelCls}>Domain Interests</label>
        <div className="flex gap-2 mb-3">
          <input 
            type="text" value={interestInput} 
            onChange={e => setInterestInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('interests', interestInput, setInterestInput))}
            placeholder="e.g. FinTech, Sustainability, Web3..."
            className="input-ghost py-4 text-base"
          />
          <button onClick={() => addToList('interests', interestInput, setInterestInput)} className="btn-primary px-6">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.interests.map((s, i) => (
            <span key={i} className="chip-active-soft flex items-center gap-1.5 px-3 py-1.5">
              {s}
              <button onClick={() => removeFromList('interests', i)} className="hover:text-red-200">✕</button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold text-t3 mr-2 self-center uppercase">Quick Add:</span>
          {SUGGESTED_INTERESTS.map(s => (
            <button key={s} onClick={() => !form.interests.includes(s) && setForm(f => ({...f, interests: [...f.interests, s]}))}
              className="px-2 py-1 rounded-md bg-slate-50 border border-border text-[9px] font-bold text-t2 hover:border-accent hover:text-accent transition-colors">
              +{s}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Experience (Dynamic) & Preferred Types */}
      <div className="space-y-6">
        <div>
          <label className={labelCls}>Past Experience</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" value={expInput}
              onChange={e => setExpInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('past_experience', expInput, setExpInput))}
              placeholder="e.g. Android Internship at Google"
              className="input-ghost py-4 text-base"
            />
            <button onClick={() => addToList('past_experience', expInput, setExpInput)} className="btn-primary px-6">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.past_experience.map((exp, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-full text-[10px] font-bold">
                {exp}
                <button onClick={() => removeFromList('past_experience', i)} className="text-slate-300 hover:text-white">✕</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Preferred Opportunity Types</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(s => {
              const on = form.preferred_types.includes(s)
              return (
                <button key={s} onClick={() => toggle('preferred_types', s)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all uppercase tracking-tighter ${
                    on ? 'bg-accent text-white border-accent' : 'bg-surface text-t2 border-border hover:border-t3'
                  }`}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={form.financial_need}
            onChange={e => setForm(f => ({...f, financial_need: e.target.checked}))}
            className="w-5 h-5 rounded-md border-border text-accent focus:ring-accent"
          />
          <span className="text-xs font-bold text-t2 group-hover:text-t1 transition-colors">Apply for Financial Aid</span>
        </label>
      </div>
    </div>
  )
}
