
# NakshaNetra: Automated Building Bye-Law Compliance Engine

NakshaNetra eliminates the tedious, weeks-long manual bottleneck in urban building permit approvals by automating plan scrutiny through a hybrid AI and rule-driven pipeline. By pairing multimodal AI for architectural dimension extraction with a deterministic statutory compliance engine, it delivers rapid, transparent, and legally tamper-proof building plan assessments.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Axios, `react-pdf`, Zustand (for mock role state).
- **Backend**: FastAPI (Python), SQLAlchemy, Uvicorn, PostgreSQL (hosted on Supabase).
- **AI Extraction (Gemini 1.5)**: Responsible exclusively for reading uploaded Naksha PDFs (visuals/text) and extracting architectural dimensions into a strict, predefined JSON schema.
- **AI Research (TinyFish API)**: Responsible exclusively for retrieving official regulatory sources (municipal circulars/webpages) to verify bye-laws flagged during scrutiny.
- **Deterministic Engine**: A Python-based rule engine that strictly compares the Gemini-extracted JSON against hard-coded municipal rules in PostgreSQL. No AI is used to make the final legal pass/fail decision.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NakshaNetra Architecture                        │
└────────────────────────────────────────────────────────────────────────┘

  [Citizen / Architect]
            │
            │ Uploads Blueprint PDF
            ▼
   ┌─────────────────┐       Extract Dimensions (JSON)       ┌────────────────────────┐
   │  React Frontend │ ────────────────────────────────────► │ Gemini 1.5 Multimodal  │
   │   (Vite + PDF)  │                                       └───────────┬────────────┘
   └────────┬────────┘                                                   │
            │                                                            ▼
            │ API Calls                                      ┌────────────────────────┐
            ▼                                                │ Strict Dimension Schema│
   ┌─────────────────┐       Deterministic Check             │  (Setbacks, FAR, etc.) │
   │ FastAPI Backend │ ◄──────────────────────────────────── └────────────────────────┘
   │    (Engine)     │
   └────────┬────────┘
            │
            ├──────────────────────────┬─────────────────────────────┐
            ▼                          ▼                             ▼
   ┌─────────────────┐       ┌─────────────────┐           ┌─────────────────┐
   │ Supabase DB     │       │ TinyFish API    │           │ Scrutiny & Admin│
   │ (Rules & Users) │       │ (Circular & Web │           │ Approval Flow   │
   │                 │       │  Verification)  │           │                 │
   └─────────────────┘       └─────────────────┘           └─────────────────┘
```

---

## 👥 User Roles (Demo Flow)

1. **Citizen**:
   - Uploads the Naksha architectural PDF plan.
   - Tracks application progress in real time.
   - Accesses approved certificates, digital signatures, and tamper-evident QR verification.

2. **AI Engine**:
   - Parses the blueprint visuals and technical drawings.
   - Structures architectural metrics (plot coverage, setbacks, floor area ratio, building height).
   - Automatically generates the preliminary Scrutiny Report against active municipal bye-laws.

3. **Scrutiny Officer**:
   - Reviews the auto-generated report with visual bounding box overlays on the blueprint.
   - Uses the integrated **TinyFish API** search to fetch official municipal gazettes and regulatory citations for any flagged bye-law discrepancies.
   - Submits a detailed review and recommends approval or rejection.

4. **Admin**:
   - Evaluates officer recommendations and full audit history.
   - Executes final statutory approval or rejection.
   - Generates digitally sealed compliance permits.

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** (and `npm`)
- **A Supabase project** (PostgreSQL database instance)

---

### 2. Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
touch backend/.env
```

Populate `backend/.env` with your credentials:

```env
# CRITICAL: Use the IPv4 Connection Pooler string (port 6543) to avoid IPv6 timeouts.
# Replace '@' in your password with '%40'.
DATABASE_URL=postgresql://postgres.[project-id]:[password]%40[year]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

GEMINI_API_KEY=your_google_ai_studio_key
TINYFISH_API_KEY=your_tinyfish_hackathon_key
```

> **Note**: A template file is available at `backend/.env.example`. Make sure your `.env` is never committed to version control.

---

### 3. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   # On Windows: venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be live at:
   - API Root: `http://127.0.0.1:8000`
   - Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
   - Health Check: `http://127.0.0.1:8000/api/health`

5. **Initialize Database Tables & Seed Rules**:
   With the server running, initialize your Supabase schema and load municipal rules:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/setup
   ```
   *(Or trigger the `/api/setup` endpoint directly via Swagger UI at `/docs`)*.

---

### 4. Frontend Setup (React + Vite)

1. Open a second terminal and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will be accessible at:
   - Web App: `http://localhost:5173`

---

## 📁 Repository Structure

```text
Innov8-NakshaNetra/
├── .gitignore               # Root gitignore protecting credentials & build outputs
├── README.md                # Project documentation & onboarding guide
├── backend/
│   ├── .env.example         # Template environment variables
│   ├── database.py          # SQLAlchemy engine & session manager
│   ├── main.py              # FastAPI endpoints & CORS configuration
│   ├── models.py            # Database models (Users, Rules, Scrutiny)
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Local Python virtual environment
└── frontend/
    ├── index.html           # HTML entry point
    ├── package.json         # Node scripts & dependencies
    ├── tailwind.config.js   # Tailwind CSS configuration
    ├── vite.config.js       # Vite configuration
    ├── public/              # Static public assets
    └── src/
        ├── App.jsx          # Root application component
        ├── main.jsx         # React DOM bootstrap
        └── index.css        # Global CSS styles
```

---

## 🔒 Security & Data Integrity

- **Deterministic Rule Enforcement**: Legal compliance decisions are strictly calculated against municipal bye-laws stored in PostgreSQL; AI models are never allowed to fabricate or decide legal status.
- **Strict Role-Based Scrutiny**: Separation of concerns between citizen upload, AI parsing, officer recommendation, and administrative sign-off ensures complete traceability.
- **Secure Secret Handling**: Database connection strings and API keys are restricted to environment variables and blocked by root `.gitignore`.
