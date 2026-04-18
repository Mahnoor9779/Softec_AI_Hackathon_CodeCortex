## InboxPilot: AI-Powered University Opportunity Ranker

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![FastAPI](https://img.shields.io/badge/Streamlit-%23FE4B4B.svg?style=for-the-badge&logo=streamlit&logoColor=white) ![Groq](https://img.shields.io/badge/Groq-F54E27?style=for-the-badge&logo=groq&logoColor=white) ![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)

**InboxPilot** is a full-stack AI-powered web application that transforms a messy university inbox into a clean, ranked list of scholarships, internships, and fellowships — in seconds. Built with **Python, FastAPI, and Streamlit**, it uses the **Groq LLM API** to extract structured opportunity data from raw email text, then applies a fully deterministic scoring algorithm to rank results by urgency and student profile match.

What sets InboxPilot apart is its zero-ML ranking engine: every scoring decision is transparent, reproducible, and explainable — no black-box models, no external databases, no heavy dependencies. It also features a built-in spam detection layer that flags scam emails before they ever reach the student.

---

## Key Features

### Student Experience
* **AI Inbox Parsing:** Paste raw, messy university emails in any format — the Groq LLM extracts structured opportunity data automatically using strict JSON mode.
* **Deterministic Ranking:** Every opportunity is scored 0–100 based on four weighted components: CGPA eligibility, location match, financial need alignment, and deadline urgency.
* **Color-Coded Deadlines:** Deadlines are visually flagged — 🔴 red for under 3 days (URGENT), 🟠 orange for under 7 days, 🟢 green for safe, and grey for expired.
* **Action Step Checklists:** Each opportunity renders its action steps as interactive Markdown checkboxes so students know exactly what to do next.
* **Profile-Aware Scoring:** The sidebar student profile (degree, CGPA, financial need, preferred location) directly drives every ranking decision in real time.

### Spam Detection Engine
* **Keyword Heuristics:** Scans raw email text for 10 known scam patterns including `wire transfer`, `claim your reward`, `bank details`, and `western union`.
* **Link Density Check:** Flags any email containing more than 4 URLs — a strong signal of phishing attempts.
* **Low-Quality Listing Detection:** Automatically flags listings with no deadline and no funding as low-effort or suspicious postings.
* **Multi-Reason Reporting:** If multiple spam signals fire simultaneously, all reasons are joined and displayed together in the UI.

### Admin Dashboard
* **Live Processing Metrics:** Displays total emails processed, spam emails detected, and valid opportunities found after every analysis run.
* **Per-Opportunity Breakdown:** Full ranked table with scores, types, locations, funding status, and spam reasons visible at a glance.
* **Session Persistence:** All results are stored in Streamlit session state — switching between tabs or adjusting the sidebar never clears your analysis.

---

## Under the Hood: Scoring Algorithm & Architecture

InboxPilot uses a **pure Python deterministic scoring function** with four weighted components that always sum to 100 points:

| Component | Weight | Logic |
|---|---|---|
| **CGPA Eligibility** | 25 pts | Full 25 if `profile.cgpa >= opp.min_cgpa`, else 0 (hard disqualifier) |
| **Location Match** | 20 pts | 20 for exact match, 10 for Remote, 0 for mismatch |
| **Financial Need** | 20 pts | 20 if need + funded, 10 if no need, 0 if need but unfunded |
| **Deadline Urgency** | 35 pts | Sliding scale: 35 (≤3 days) → 28 (≤7) → 20 (≤14) → 12 (≤30) → 6 (>30) → 5 (no deadline) → 0 (expired) |

*No machine learning. No randomness. The same input always produces the same score.*

### Architecture Flow
1. **Streamlit Frontend** captures user profile and raw emails, sending a synchronous `POST` request to the backend.
2. **FastAPI Backend** intercepts the request and routes the raw text to the **Groq API (llama3-8b-8192)** with strict `json_object` formatting constraints.
3. The backend runs the extracted JSON through the **pure Python Spam Heuristics** and the **Deterministic Weighted Scorer**.
4. The finalized, ranked array is returned to Streamlit to render the interactive UI cards.

---

## Getting Started

### Prerequisites
* [Python 3.10+](https://www.python.org/downloads/) (Python 3.11 recommended)
* A free [Groq API Key](https://console.groq.com/keys)

### Installation
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Mahnoor9779/Softec_AI_Hackathon_CodeCortex](https://github.com/Mahnoor9779/Softec_AI_Hackathon_CodeCortex)
   cd InboxPilot
