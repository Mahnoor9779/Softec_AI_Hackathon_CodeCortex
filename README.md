# Opportunity Inbox Copilot — SOFTEC 2026

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
# Create .env with GROQ_API_KEY=gsk_...
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173.

## Architecture
- AI: Two Groq calls — extraction batch + gap analysis batch
- Sanitiser: sanitiser.py repairs all LLM output before scoring
- Scorer: Pure Python, no AI, 9 explicit dimensions, auditable
- Gap matching: by rank integer (not title string — never drifts)
