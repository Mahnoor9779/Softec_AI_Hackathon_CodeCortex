# Opportunity Inbox Copilot — SOFTEC 2026

## Overview
**Opportunity Inbox Copilot** is an AI-powered full-stack application designed to help students navigate messy university inboxes. It extracts scholarships, internships, and fellowships, scores them based on eligibility and urgency, and provides an actionable career roadmap.

## Tech Stack
- **Backend**: FastAPI, Groq (Llama 3), Pydantic
- **Frontend**: React (Vite), Tailwind CSS
- **Logic**: Deterministic 9-dimension scoring engine

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
# Create .env with GROQ_API_KEY=gsk_...
uvicorn main:app --reload --port 8010
```

### Frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_URL=http://localhost:8010
npm run dev
```

Open http://localhost:5173.

## Architecture
- **AI**: Structured extraction and gap analysis via Groq.
- **Sanitiser**: Repairs LLM output to ensure deterministic scoring.
- **Scorer**: Auditable Python engine with weighted dimensions.
- **Gap matching**: Integer-based rank matching for consistency.
