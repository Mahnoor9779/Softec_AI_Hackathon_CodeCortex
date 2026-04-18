"""
sanitiser.py — Post-LLM field validation and repair.
Runs on every extracted item before scoring.
Never crashes. Always returns a safe dict.
"""

import re
import calendar
from datetime import date

VALID_TYPES = {
    "internship", "scholarship", "fellowship", "competition",
    "research", "exchange_program", "admission", "volunteer", "other"
}

TYPE_ALIASES = {
    "job": "internship", "jobs": "internship",
    "grant": "scholarship", "bursary": "scholarship",
    "volunteer": "volunteer", "volunteering": "volunteer",
    "contest": "competition", "hackathon": "competition",
    "masters": "admission", "phd": "admission",
    "postgraduate": "admission", "graduate": "admission",
}

MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "jun": 6, "jul": 7, "aug": 8, "sep": 9,
    "oct": 10, "nov": 11, "dec": 12,
}

DOC_MAP = {
    "cv": "cv", "resume": "cv", "curriculum vitae": "cv",
    "transcript": "transcript", "unofficial transcript": "transcript",
    "recommendation letter": "recommendation_letter",
    "reference letter": "recommendation_letter",
    "personal statement": "personal_statement",
    "statement of purpose": "personal_statement", "sop": "personal_statement",
    "portfolio": "portfolio",
    "cnic": "cnic_copy", "cnic copy": "cnic_copy", "national id": "cnic_copy",
    "income certificate": "income_certificate",
    "family income certificate": "income_certificate",
    "fee challan": "fee_challan",
}


def _parse_deadline(raw: str) -> str | None:
    """
    Try to parse any natural language date into YYYY-MM-DD.
    Supports: YYYY-MM-DD, "April 30 2026", "30 April 2026",
              "April 30, 2026", "30-Apr-2026", "May 2026" (→ last day).
    Falls back to None — never crashes.
    """
    raw = raw.strip()
    if not raw or raw.lower() in (
        "null", "none", "rolling", "asap", "open",
        "ongoing", "tbd", "n/a", "not specified", ""
    ):
        return None

    # Already YYYY-MM-DD
    if re.match(r"^\d{4}-\d{2}-\d{2}$", raw):
        return raw

    # Try dateparser as primary (handles most natural language)
    try:
        import dateparser
        parsed = dateparser.parse(
            raw,
            settings={
                "PREFER_DAY_OF_MONTH": "last",
                "PREFER_DATES_FROM": "future",
                "RETURN_AS_TIMEZONE_AWARE": False,
            }
        )
        if parsed:
            return parsed.strftime("%Y-%m-%d")
    except Exception:
        pass

    # Manual fallback for common Pakistani email formats
    raw_lower = raw.lower()

    # "April 30 2026" or "April 30, 2026" or "30 April 2026"
    m = re.search(
        r"(\d{1,2})\s+([a-z]+)\s+(\d{4})|([a-z]+)\s+(\d{1,2})[,\s]+(\d{4})",
        raw_lower
    )
    if m:
        if m.group(1):  # day month year
            day, month_str, year = int(m.group(1)), m.group(2), int(m.group(3))
        else:           # month day year
            month_str, day, year = m.group(4), int(m.group(5)), int(m.group(6))
        month = MONTHS.get(month_str)
        if month:
            try:
                return date(year, month, day).strftime("%Y-%m-%d")
            except ValueError:
                pass

    # "30-Apr-2026" or "30-April-2026"
    m2 = re.match(r"(\d{1,2})-([a-z]+)-(\d{4})", raw_lower)
    if m2:
        day, month_str, year = int(m2.group(1)), m2.group(2), int(m2.group(3))
        month = MONTHS.get(month_str)
        if month:
            try:
                return date(year, month, day).strftime("%Y-%m-%d")
            except ValueError:
                pass

    # "May 2026" — no day → last day of month
    m3 = re.search(r"([a-z]+)\s+(\d{4})", raw_lower)
    if m3:
        month_str, year = m3.group(1), int(m3.group(2))
        month = MONTHS.get(month_str)
        if month:
            last_day = calendar.monthrange(year, month)[1]
            return f"{year}-{month:02d}-{last_day}"

    return None


def _normalise_doc(raw: str) -> str:
    raw = raw.lower().strip()
    for k, v in DOC_MAP.items():
        if k in raw:
            return v
    return raw.replace(" ", "_")


def sanitise(item: dict) -> dict:
    """Normalise and repair all LLM-extracted fields. Never raises."""

    # is_opportunity
    item["is_opportunity"] = bool(item.get("is_opportunity", False))

    # deadline
    raw_dl = str(item.get("deadline") or "")
    item["deadline"] = _parse_deadline(raw_dl)

    # cgpa_min — must be float 0.0–4.0
    try:
        cgpa_raw = str(item.get("cgpa_min") or "0")
        cgpa_raw = re.sub(r"[^0-9.]", "", cgpa_raw.replace("+", "").strip()) or "0"
        cgpa = float(cgpa_raw)
        item["cgpa_min"] = round(min(max(cgpa, 0.0), 4.0), 1)
    except Exception:
        item["cgpa_min"] = 0.0

    # is_paid — must be bool
    paid = item.get("is_paid")
    item["is_paid"] = paid is True or str(paid).lower() in ("true", "yes", "1")

    # type — enforce enum
    raw_type = str(item.get("type") or "other").lower().strip()
    item["type"] = TYPE_ALIASES.get(raw_type, raw_type if raw_type in VALID_TYPES else "other")

    # skills_required — must be list of lowercase strings
    sr = item.get("skills_required")
    if isinstance(sr, str):
        item["skills_required"] = [s.strip().lower() for s in sr.split(",") if s.strip()]
    elif isinstance(sr, list):
        item["skills_required"] = [str(s).lower().strip() for s in sr]
    else:
        item["skills_required"] = []

    # docs_required — must be list of normalised strings
    dr = item.get("docs_required")
    if isinstance(dr, str):
        dr = [d.strip() for d in dr.split(",") if d.strip()]
    elif not isinstance(dr, list):
        dr = []
    item["docs_required"] = [_normalise_doc(d) for d in dr]

    # org_name — never null
    item["org_name"] = str(item.get("org_name") or "Unknown").strip()
    if not item["org_name"]:
        item["org_name"] = "Unknown"

    # summary — cap at 30 words
    words = str(item.get("summary") or "").split()
    item["summary"] = " ".join(words[:30]) + ("…" if len(words) > 30 else "")

    # email_index — must be int
    try:
        item["email_index"] = int(item.get("email_index") or 0)
    except Exception:
        item["email_index"] = 0

    return item
