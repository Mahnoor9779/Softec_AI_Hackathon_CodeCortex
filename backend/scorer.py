"""
scorer.py — Deterministic scoring engine. No AI. Pure Python.
All weights are explicit and auditable by judges.
Max possible score: ~130 pts.
"""

from datetime import datetime, date
from typing import Tuple, List

SKILL_ALIASES: dict[str, str] = {
    "ml/ai":                       "machine learning",
    "machine learning":            "machine learning",
    "ml":                          "machine learning",
    "ai":                          "machine learning",
    "deep learning":               "machine learning",
    "artificial intelligence":     "machine learning",
    "dsa/competitive programming": "data structures",
    "dsa":                         "data structures",
    "competitive programming":     "data structures",
    "data structures":             "data structures",
    "algorithms":                  "data structures",
    "data analysis":               "data analysis",
    "cloud/aws":                   "cloud",
    "aws":                         "cloud",
    "gcp":                         "cloud",
    "azure":                       "cloud",
    "cloud":                       "cloud",
    "javascript":                  "javascript",
    "js":                          "javascript",
    "node.js":                     "javascript",
    "react":                       "javascript",
    "research writing":            "research",
    "research":                    "research",
    "embedded systems":            "embedded",
    "mysql":                       "sql",
    "postgresql":                  "sql",
    "sqlite":                      "sql",
    "sql":                         "sql",
}

ORG_TIER: dict[str, int] = {
    # Tier 3 — global/government/UN
    "google": 3, "microsoft": 3, "meta": 3, "amazon": 3, "apple": 3,
    "ibm": 3, "intel": 3, "nvidia": 3, "openai": 3, "anthropic": 3,
    "hec": 3, "un ": 3, "unicef": 3, "world bank": 3, "usaid": 3,
    "fulbright": 3, "british council": 3, "daad": 3,
    # Tier 2 — strong Pakistani tech
    "tkxel": 2, "arbisoft": 2, "netsol": 2, "systems limited": 2,
    "10pearls": 2, "i2c": 2, "folio3": 2, "techlogix": 2,
    "siemens": 2, "lums": 2, "aga khan": 2,
    # Tier 1 — small/gig
    "educative": 1, "fiverr": 1, "upwork": 1,
}

GOAL_ALIGNMENT: dict[tuple, int] = {
    ("research",         "research"): 25,
    ("fellowship",       "research"): 20,
    ("scholarship",      "research"): 10,
    ("internship",       "industry"): 20,
    ("competition",      "industry"): 12,
    ("fellowship",       "industry"): 8,
    ("internship",       "startup"):  15,
    ("competition",      "startup"):  10,
    ("scholarship",      "abroad"):   20,
    ("exchange_program", "abroad"):   25,
    ("fellowship",       "abroad"):   18,
    ("admission",        "abroad"):   22,
}


def normalize_skill(s: str) -> str:
    return SKILL_ALIASES.get(s.lower().strip(), s.lower().strip())


def days_until(deadline_str: str | None) -> int:
    if not deadline_str:
        return 999
    try:
        d = datetime.strptime(deadline_str.strip(), "%Y-%m-%d").date()
        return max(0, (d - date.today()).days)
    except Exception:
        return 999


def score_opportunity(opp: dict, profile: dict) -> Tuple[int, List[str]]:
    score = 10
    reasons: List[str] = ["[+10] Basic opportunity eligibility"]
    opp_type = (opp.get("type") or "").lower().strip()

    # 1. CGPA eligibility (−15 penalty or +20 pass)
    cgpa_min = float(opp.get("cgpa_min") or 0)
    student_cgpa = float(profile.get("cgpa") or 0)
    if cgpa_min and student_cgpa < cgpa_min:
        score -= 15
        reasons.append(f"[-15] CGPA {student_cgpa:.1f} below required {cgpa_min:.1f}")
    elif cgpa_min:
        score += 20
        reasons.append(f"[+20] CGPA {student_cgpa:.1f} meets minimum {cgpa_min:.1f}")
    else:
        score += 15
        reasons.append("[+15] No CGPA restriction — open access")

    # 2. Skill overlap (up to +20, 7 pts per skill)
    req_skills = {normalize_skill(s) for s in (opp.get("skills_required") or [])}
    stu_skills = {normalize_skill(s) for s in (profile.get("skills") or [])}
    overlap = req_skills & stu_skills
    skill_pts = min(len(overlap) * 7, 20)
    score += skill_pts
    if overlap:
        reasons.append(f"[+{skill_pts}] Skills matched: {', '.join(sorted(overlap))}")
    elif req_skills:
        reasons.append("[+0] No skill overlap — learning required")

    # 3. Preferred type match (+10)
    pref_types = [t.lower().strip() for t in (profile.get("preferred_types") or [])]
    if opp_type in pref_types:
        score += 10
        reasons.append(f"[+10] Matches your preferred type '{opp_type}'")

    # 4. Urgency (up to +30)
    days = days_until(opp.get("deadline"))
    opp["days_left"] = days
    if days == 0:
        score += 30
        reasons.append("[+30] DEADLINE TODAY — act immediately")
    elif days <= 3:
        score += 28
        reasons.append(f"[+28] URGENT — {days} day(s) left")
    elif days <= 7:
        score += 22
        reasons.append(f"[+22] Deadline in {days} days this week")
    elif days <= 14:
        score += 14
        reasons.append(f"[+14] Deadline in {days} days")
    elif days <= 30:
        score += 7
        reasons.append(f"[+7] Deadline in {days} days")
    else:
        score += 5
        reasons.append("[+5] Rolling / no stated deadline")

    # 5. Documents readiness (up to +10)
    req_docs = {d.lower().replace(" ", "_") for d in (opp.get("docs_required") or [])}
    ready_docs = {d.lower().replace(" ", "_") for d in (profile.get("documents_ready") or [])}
    doc_overlap = req_docs & ready_docs
    doc_score = min(len(doc_overlap) * 4, 10)
    score += doc_score
    if doc_overlap:
        reasons.append(f"[+{doc_score}] Docs already ready: {', '.join(sorted(doc_overlap))}")

    # 6. Org prestige (+3/+8/+15)
    org_name = (opp.get("org_name") or "").lower()
    tier = 0
    for k, v in ORG_TIER.items():
        if k in org_name:
            tier = v
            break
    tier_pts = {3: 15, 2: 8, 1: 3, 0: 5}[tier]
    tier_label = {
        3: "Tier-1 global/govt", 2: "Tier-2 strong org",
        1: "Tier-3 small org", 0: "Unknown org"
    }[tier]
    score += tier_pts
    reasons.append(f"[+{tier_pts}] Market value: {tier_label}")

    # 7. Career goal alignment (up to +25)
    future_goal = (profile.get("future_goal") or "").lower().strip()
    alignment_pts = GOAL_ALIGNMENT.get((opp_type, future_goal), 0)
    score += alignment_pts
    if alignment_pts:
        reasons.append(
            f"[+{alignment_pts}] Aligns with goal '{future_goal}' "
            f"({opp_type} → {future_goal})"
        )

    # 8. Financial need (+5)
    if profile.get("financial_need") and opp.get("is_paid"):
        score += 5
        reasons.append("[+5] Paid opportunity matches financial need")

    # 9. Location match (+5)
    loc_pref = (profile.get("location_preference") or "any").lower()
    opp_loc = (opp.get("location") or "").lower()
    if loc_pref == "any" or loc_pref in opp_loc or "remote" in opp_loc:
        score += 5
        reasons.append("[+5] Location matches your preference")

    # 10. Interest overlap (+5 max)
    interests = {i.lower().strip() for i in (profile.get("interests") or [])}
    summary_lower = (opp.get("summary") or "").lower()
    title_lower = (opp.get("title") or "").lower()
    interest_matches = [i for i in interests if i in summary_lower or i in title_lower]
    if interest_matches:
        score += 5
        reasons.append(f"[+5] Aligns with your interests: {', '.join(interest_matches[:3])}")

    # 11. Past experience bonus (+5)
    past_exp = {e.lower() for e in (profile.get("past_experience") or [])}
    if opp_type in past_exp:
        score += 5
        reasons.append(f"[+5] Relevant past experience in {opp_type}")

    final_score = min(score, 100)
    return max(final_score, 5), reasons
