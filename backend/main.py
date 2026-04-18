from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os, json, re
from dotenv import load_dotenv
from groq import Groq
from scorer import score_opportunity
from prompts import EXTRACTION_PROMPT, GAP_ANALYSIS_PROMPT
from sanitiser import sanitise

load_dotenv()

app = FastAPI(title="Opportunity Inbox Copilot API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


# ── Pydantic models ───────────────────────────────────────────────────────────

class Profile(BaseModel):
    degree: str
    semester: int
    cgpa: float
    skills: List[str]
    interests: List[str]
    preferred_types: List[str]
    financial_need: bool
    location_preference: str    # "any" | "remote" | "local" | "international"
    future_goal: str            # "research" | "industry" | "startup" | "abroad"
    documents_ready: List[str]
    past_experience: List[str]
    hours_available_per_week: int

class AnalyzeRequest(BaseModel):
    raw_emails: str
    profile: Profile

class AnalyzeResponse(BaseModel):
    opportunities: list
    filtered_out: list
    gap_analysis: list


# ── Helpers ───────────────────────────────────────────────────────────────────

def split_emails(raw: str) -> List[str]:
    # Strategy A: Explicit separators
    if '---' in raw:
        parts = re.split(r'\n-{3,}\n', raw)
    else:
        # Strategy B: Implicit "Subject:" start detection
        parts = re.split(r'\n(?=Subject:)', '\n' + raw, flags=re.IGNORECASE)
        
    return [p.strip() for p in parts if len(p.strip()) > 20]


def extract_list_from_response(parsed, primary_key: str) -> list:
    """Robustly extract a list regardless of Groq's response key."""
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict):
        if primary_key in parsed and isinstance(parsed[primary_key], list):
            return parsed[primary_key]
        for v in parsed.values():
            if isinstance(v, list) and len(v) > 0:
                return v
    raise ValueError(
        f"Cannot find list in response. "
        f"Keys: {list(parsed.keys()) if isinstance(parsed, dict) else type(parsed)}"
    )


def groq_call(system: str, user: str, max_tokens: int = 4000) -> str:
    """Single Groq call with JSON mode enforced."""
    try:
        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            temperature=0,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        return resp.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq API Error: {str(e)}")


def groq_call_with_retry(system: str, user: str, max_tokens: int = 4000) -> str:
    """Retry once on failure."""
    try:
        return groq_call(system, user, max_tokens)
    except Exception as e:
        print(f"[GROQ] First attempt failed: {e}. Retrying...")
        return groq_call(system, user, max_tokens)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    emails = split_emails(req.raw_emails)

    if not emails:
        raise HTTPException(400, "No emails detected. Separate emails with ---")
    if len(emails) > 15:
        raise HTTPException(400, "Maximum 15 emails per request")

    # ── Step 1: AI extraction ────────────────────────────────────────────────
    email_block = "\n\n".join(
        f"EMAIL {i+1}:\n{e}" for i, e in enumerate(emails)
    )
    user_extraction = (
        f"Process exactly {len(emails)} emails. "
        f"Return a JSON object with key 'emails' containing an array. "
        f"One or more objects per email for digest-style emails.\n\n"
        f"{email_block}"
    )

    try:
        raw_extraction = groq_call_with_retry(
            EXTRACTION_PROMPT, user_extraction, max_tokens=4000
        )
        parsed = json.loads(raw_extraction)
        raw_extracted = extract_list_from_response(parsed, "emails")
    except Exception as e:
        raise HTTPException(500, f"AI extraction failed: {str(e)}")

    # ── Step 2: Sanitise + score ─────────────────────────────────────────────
    opportunities = []
    filtered_out = []
    profile_dict = req.profile.model_dump()

    for item in raw_extracted:
        if not isinstance(item, dict):
            continue
        item = sanitise(item)  # repair all fields before scoring
        if item.get("is_opportunity"):
            score, reasons = score_opportunity(item, profile_dict)
            item["score"] = score
            item["score_reasons"] = reasons
            opportunities.append(item)
        else:
            filtered_out.append(item)

    opportunities.sort(key=lambda x: x.get("score", 0), reverse=True)
    for i, opp in enumerate(opportunities):
        opp["rank"] = i + 1

    # ── Step 3: Gap analysis ─────────────────────────────────────────────────
    gap_analysis = []
    if opportunities:
        user_gap = (
            f"Student profile:\n{json.dumps(profile_dict, indent=2)}\n\n"
            f"Ranked opportunities (MUST include 'rank' field in each output plan, "
            f"copied exactly from input):\n{json.dumps(opportunities, indent=2)}\n\n"
            f"Return a JSON object with key 'plans' containing exactly "
            f"{len(opportunities)} gap analysis objects in rank order."
        )
        try:
            raw_gap = groq_call_with_retry(
                GAP_ANALYSIS_PROMPT, user_gap, max_tokens=3000
            )
            parsed_gap = json.loads(raw_gap)
            gap_analysis = extract_list_from_response(parsed_gap, "plans")
        except Exception as e:
            print(f"[GAP] Gap analysis failed (non-fatal): {e}")
            gap_analysis = []  # non-fatal — cards degrade gracefully

    return AnalyzeResponse(
        opportunities=opportunities,
        filtered_out=filtered_out,
        gap_analysis=gap_analysis,
    )

@app.get("/sample-emails")
def sample_emails():
    from sample_emails import SAMPLE_EMAILS
    return {"raw": SAMPLE_EMAILS}

@app.get("/health")
def health():
    return {"status": "ok", "model": "llama-3.3-70b-versatile"}
