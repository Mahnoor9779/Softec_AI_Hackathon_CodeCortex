# CLAUDE.md

## Commands
- Backend: `cd backend && uvicorn main:app --reload --port 8000`
- Frontend: `cd frontend && npm run dev`
- Health: `curl http://localhost:8000/health`

## Key decisions
- sanitiser.py runs between LLM output and scorer — field repair, type enforcement
- Gap analysis matched by rank (integer), not title (string) — title drift is a known LLM failure
- dateparser library + manual fallback handles all Pakistani date formats
- SKILL_ALIASES normalises "ML/AI" chip → "machine learning" for set intersection
- groq_call_with_retry retries once on failure — non-fatal after that
- Gap analysis failure is non-fatal — cards degrade gracefully without it
- scorer.py is pure Python — judges can audit every point

## Scoring dimensions (scorer.py)
CGPA fit · skill overlap · type preference · urgency · docs ready ·
org prestige · career alignment · financial need · location
Max ~130 pts. −30 penalty for CGPA below requirement.
