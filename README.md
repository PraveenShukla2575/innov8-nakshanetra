# NakshaNetra: Automated Building Bye-Law Compliance Engine

**Built for HackIIITD '26** 🚀

### Live Demo
The application is successfully deployed and live:
- **Frontend (Vercel):** https://innov8-nakshanetra-99rm.vercel.app

- **Backend:** Hosted on Render

NakshaNetra eliminates the tedious, weeks-long manual bottleneck in urban building permit approvals by automating architectural plan scrutiny through a hybrid AI and rule-driven pipeline. By pairing multimodal computer vision for spatial metric extraction with a deterministic statutory compliance engine and live web-based regulatory retrieval, NakshaNetra delivers rapid, transparent, and tamper-proof building plan assessments.

---

## 🌟 Key Features

- **Multimodal AI Plan Extraction (Google Gemini Vision)**:
  - Ingests architectural blueprints in `.pdf`, `.jpg`, `.jpeg`, and `.png` formats.
  - Automatically extracts key dimensional parameters (Rear Setbacks, Ground Coverage, Building Height) into a structured JSON schema.
  - Resilient spatial estimation fallback if technical drawings lack explicit text dimension schedules.

- **Deterministic Statutory Rule Engine**:
  - Compares extracted metrics directly against municipal bye-law thresholds stored in SQL (`BL-001`, `BL-002`, etc.).
  - Calculates dynamic penalty scores (0 to 100) and legal compliance verdicts (`APPROVED`, `REJECTED`, `PENDING_REVIEW`).
  - Strict separation of concerns: AI is restricted to metric extraction; statutory pass/fail determinations are 100% deterministic and legally auditable.

- **Live Regulatory & Architect Verification (TinyFish Web Agent API)**:
  - **Bye-Law Citations**: Scrapes and cites live municipal gazettes and building regulations (Delhi Master Plan 2021, Unified Building Bye-Laws UBBL, National Building Code NBC 2016, CPCB) directly linked to flagged discrepancies.
  - **Architect License Verification**: Verifies architect/builder registration numbers and licensing status in real time against Council of Architecture (CoA) India and RERA registries.

- **Role-Based Portals & Officer Approval Lifecycle**:
  - **Citizen Portal**: Plan upload, live multi-stage scanning animation, instant scrutiny reports, architect license verification, and revise-and-resubmit workflow.
  - **Officer Portal**: Scrutiny queue, inspection dossiers, live TinyFish bye-law verification, and sanction recommendations.
  - **Admin Portal**: Platform telemetry, system health monitoring, audit records, and an Officer Approval Queue where admins review and approve newly registered officers before they can access the system.

- **Client-Side Tamper-Evident PDF Dossiers (`jsPDF`)**:
  - Generates downloadable official Scrutiny Dossiers and Sanction Notices client-side with complete parameter comparison tables, official remarks, and SHA-256 digital seals.

- **Zero-Config Database Flexibility**:
  - Runs out of the box with local SQLite (`nakshanetra.db`) for instant offline/demo execution.
  - Supports enterprise cloud deployment with PostgreSQL on Supabase via `DATABASE_URL`.

---

## 🏗️ Architecture & Tech Stack

### Technology Matrix

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router 7, Axios, Zustand | Responsive civic tech interface with nested role routes & state management |
| **Icons & UI** | Lucide React, Glassmorphism & Emerald/Navy GovTech palette | Modern, accessible government portal aesthetics |
| **PDF Generation** | `jspdf`, `jspdf-autotable` | Client-side export of official scrutiny dossiers and compliance permits |
| **Backend** | FastAPI, Uvicorn, SQLAlchemy, Pydantic | Asynchronous RESTful API with automated schema migration & seeding |
| **Database** | SQLite (default local) / PostgreSQL (Supabase) | User accounts, active building bye-law rules, submitted applications & scrutiny reports |
| **Authentication** | JWT (HS256 via `python-jose`), Passlib & Bcrypt | Secure role-based access control (Citizen, Officer, Admin) with admin approval lifecycle |
| **AI Extraction** | Google Gemini Vision (`google-generativeai`) | Multimodal extraction of architectural metrics from blueprints |
| **Live Web Agent** | TinyFish API (`requests`) | Real-time statutory citation retrieval and Council of Architecture (CoA) license lookup |
| **Compliance** | Deterministic Python Rule Engine | Legal threshold verification, dynamic penalty scoring, and audit summary |

---

### Architecture Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NakshaNetra Architecture                        │
└────────────────────────────────────────────────────────────────────────┘

        [ Citizen / Architect ]                     [ Scrutiny Officer / Admin ]
                  │                                               ▲
                  │ Uploads Blueprint (PDF/IMG)                   │ Approvals & Audits
                  ▼                                               │
       ┌─────────────────────┐                         ┌─────────────────────┐
       │   React 19 Portal   │ ◄────────────────────── │ Role Dashboards     │
       │    (Vite + Router)  │   Download PDF Dossier  │ (Queue & Telemetry) │
       └──────────┬──────────┘                         └──────────▲──────────┘
                  │                                               │
                  │ Multipart Upload & API Calls                  │
                  ▼                                               │
       ┌─────────────────────┐                         ┌──────────┴──────────┐
       │   FastAPI Backend   │ ──────────────────────► │ Scrutiny & Approval │
       │ (Auth & Endpoints)  │                         │       Workflow      │
       └──────────┬──────────┘                         └─────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Gemini Vision │   │ TinyFish API  │
│ (Extraction)  │   │ (Live Web)    │
└───────┬───────┘   └───────┬───────┘
        │ Strict            │ CoA License &
        │ Dimensions        │ Bye-Law Citations
        ▼                   ▼
┌───────────────────────────────────┐
│     Deterministic Rule Engine     │
│ (Evaluates Setbacks, FAR, Height) │
└─────────────────┬─────────────────┘
                  │
                  ▼
┌───────────────────────────────────┐
│       Database Storage            │
│ (SQLite / Supabase PostgreSQL)    │
│  - Users & Roles                  │
│  - Bye-Law Rules (BL-001, BL-002) │
│  - Applications & Reports         │
└───────────────────────────────────┘
```

---

## 👥 User Roles & Demo Credentials

NakshaNetra comes pre-seeded with demo accounts for all three user roles. You can either use the **Quick Demo Auto-Fill** buttons on the login page or enter these credentials manually:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Citizen** | `citizen.ravi@gmail.com` | `Citizen@Naksha2026` | Upload blueprints, view instant AI scrutiny reports, verify architect licenses, download PDF sanction dossiers, submit revisions |
| **Officer** | `officer.priya@mcd.gov.in` | `Officer@Naksha2026` | Review scrutiny queue, inspect flagged violations, query TinyFish for statutory citations, verify CoA credentials, recommend approvals |
| **Admin** | `admin@nakshanetra.gov.in` | `Admin@Naksha2026` | Monitor platform telemetry, evaluate officer recommendations, approve pending officer sign-ups, review audit records |

> **Note on Officer Sign-Up**: If a user registers with the `Officer` role, their status is set to `PENDING` by default. An Administrator must log in to the Admin Dashboard and approve their account under the **Officer Approvals Queue** before they can log in.

---

## 📁 Repository Structure

```text
Innov8-NakshaNetra/
├── .gitignore                      # Git ignore rules for credentials, DB files, and build outputs
├── README.md                       # Complete project documentation & developer guide
├── backend/
│   ├── .env.example                # Template environment variables
│   ├── auth.py                     # JWT token encoding/decoding and bcrypt password hashing
│   ├── database.py                 # SQLAlchemy engine, session factory & SQLite/Postgres fallback
│   ├── gemini_service.py           # Gemini Vision API integration with spatial estimation fallback
│   ├── generate_test_plans.py      # Pillow script generating synthetic compliant & violation plans
│   ├── main.py                     # FastAPI application, CORS, static mounts, and all REST endpoints
│   ├── models.py                   # SQLAlchemy ORM models (User, Rule, Application, ScrutinyReport)
│   ├── nakshanetra.db              # Default local SQLite database (auto-created on startup)
│   ├── requirements.txt            # Python dependencies
│   ├── rule_engine.py              # Deterministic statutory bye-law comparison & penalty scoring
│   ├── schemas.py                  # Pydantic request & response models
│   ├── test_plans/                 # Generated test plans (plan1_compliant.jpg, plan2_violation.jpg)
│   ├── tinyfish_service.py         # TinyFish Web Agent for live bye-law search & CoA verification
│   └── uploads/                    # Local storage for blueprint files submitted via API
└── frontend/
    ├── index.html                  # HTML5 entry point
    ├── package.json                # Dependencies (React 19, Vite, Tailwind v4, jsPDF, Zustand)
    ├── postcss.config.js           # PostCSS configuration
    ├── tailwind.config.js          # Tailwind CSS theme styling
    ├── vite.config.js              # Vite bundler configuration
    ├── public/
    │   ├── favicon.svg             # Government emblem / portal favicon
    │   ├── icons.svg               # SVG icons
    │   └── test_plans/             # Sample blueprint assets for instant browser testing
    └── src/
        ├── App.css                 # Application animations and utility styles
        ├── App.jsx                 # Routing setup (React Router 7) with nested role layouts
        ├── index.css               # Global Tailwind CSS directives & color variables
        ├── main.jsx                # React root bootstrap
        ├── store.js                # Zustand store for user session state
        ├── assets/                 # Branding assets (logo.png, hero.png)
        ├── context/
        │   └── AuthContext.jsx     # Authentication context provider with JWT localStorage sync
        ├── components/
        │   ├── layout/
        │   │   └── RolePortalLayout.jsx        # Sidebar navigation, header, and role banner wrapper
        │   ├── profile/
        │   │   └── ProfileModal.jsx            # User profile viewer modal
        │   ├── scanner/
        │   │   ├── UploadZone.jsx              # Blueprint drag-and-drop & live scanning progress
        │   │   └── ArchitectVerificationPanel.jsx # Real-time CoA India architect license checker
        │   └── ui/
        │       ├── Button.jsx                  # Reusable button with variants & loading state
        │       ├── Card.jsx                    # Standard container card
        │       ├── DataTable.jsx               # Sortable data table with search & pagination
        │       ├── Modal.jsx                   # Accessible modal dialog
        │       └── StatusBadge.jsx             # Visual status badges (APPROVED, REJECTED, PENDING)
        ├── lib/
        │   └── pdfGenerator.js     # Client-side PDF generator (jsPDF & autoTable)
        └── pages/
            ├── LoginPage.jsx       # Login/Registration page with 1-click Quick Demo role buttons
            └── dashboards/
                ├── AdminDashboard.jsx          # Platform telemetry, audit logs & officer approvals
                ├── CitizenDashboard.jsx        # Blueprint submission, scrutiny report & history
                ├── OfficerDashboard.jsx        # Inspection queue & TinyFish bye-law citation search
                ├── ReportsView.jsx             # Role-specific compliance dossiers & PDF export
                └── SettingsView.jsx            # Municipal jurisdiction & alert preferences
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- *(Optional)* A **Supabase** account if you wish to use PostgreSQL instead of SQLite.

---

### 2. Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Populate `backend/.env`:

```env
# Database URL:
# Leave blank or omit to automatically use local SQLite (sqlite:///./nakshanetra.db)
# Or configure Supabase PostgreSQL (use port 6543 pooler string):
# DATABASE_URL=postgresql://postgres.[project-id]:[password]%40[year]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Google AI Studio API Key for Gemini Multimodal Vision:
GEMINI_API_KEY=your_google_ai_studio_key

# TinyFish Web Agent API Key for live regulatory citations & CoA verification:
TINYFISH_API_KEY=your_tinyfish_api_key

# Optional: JWT Secret Key
JWT_SECRET_KEY=nakshanetra_secret_govtech_jwt_key_2026_secured
```

> **Note**: Both `GEMINI_API_KEY` and `TINYFISH_API_KEY` have built-in graceful fallbacks in code so the application runs smoothly even if API keys have limited quotas or are running in test environments.

---

### 3. Backend Setup (FastAPI)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. *(Optional)* Generate sample test architectural plans:
   ```bash
   python generate_test_plans.py
   ```
   This creates `backend/test_plans/plan1_compliant.jpg` and `backend/test_plans/plan2_violation.jpg`.

5. Start the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

6. The backend is live at:
   - **API Root**: `http://127.0.0.1:8000`
   - **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
   - **Health Check**: `http://127.0.0.1:8000/api/health`

> **Automatic DB Migration & Seeding**: The server automatically initializes tables and seeds the demo users and rules on startup. You can also re-trigger seeding at any time via `POST http://127.0.0.1:8000/api/setup`.

---

### 4. Frontend Setup (React 19 + Vite)

1. Open a second terminal and navigate to `frontend/`:
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

4. Open your browser and navigate to:
   - **Web App**: `http://localhost:5173`

---

## 🧪 Testing the Compliance Pipeline

1. **Log in as Citizen**:
   - Navigate to `http://localhost:5173`.
   - Click the **Citizen** demo badge or log in with `citizen.ravi@gmail.com` / `Citizen@Naksha2026`.
2. **Upload a Plan**:
   - Drag and drop `backend/test_plans/plan1_compliant.jpg` (or any blueprint image/PDF).
   - Watch the 4-stage AI scanning animation.
   - Review the extracted Rear Setback and Ground Coverage values.
   - Note the **Statutory Rule Evaluation Matrix** and dynamic risk penalty score.
3. **Verify Architect License**:
   - In the Scrutiny Report, review the **Council of Architecture (CoA) India Verification** card.
   - Click "Re-verify License Status" to run a live TinyFish verification.
4. **Download PDF Dossier**:
   - Click **"Download Official Dossier"** to export the client-side generated PDF complete with tables and digital verification stamp.
5. **Log in as Scrutiny Officer**:
   - Click Logout and log in with the **Officer** badge (`officer.priya@mcd.gov.in` / `Officer@Naksha2026`).
   - Open the **Scrutiny Queue** to review submissions.
   - Click **"Verify Official Gazette Citation"** next to any rule code to test the live TinyFish bye-law search.
6. **Log in as Admin**:
   - Click Logout and log in with the **Admin** badge (`admin@nakshanetra.gov.in` / `Admin@Naksha2026`).
   - View Platform Telemetry, review the system health indicators, and manage the **Officer Approvals Queue**.

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/setup` | Initializes DB tables, migrates columns, and seeds default users/rules |
| `POST` | `/api/auth/register` | Registers new Citizen, Officer (pending approval), or Admin |
| `POST` | `/api/auth/login` | Authenticates user and returns JWT bearer token |
| `GET` | `/api/admin/pending-officers` | Lists officer accounts awaiting administrative approval |
| `PATCH` | `/api/admin/approve-officer/{id}` | Approves a pending officer account |
| `POST` | `/api/applications/upload` | Multipart upload for blueprint PDF/image; triggers Gemini extraction & rule engine |
| `GET` | `/api/applications` | Fetches applications queue with optional `role` or `user_id` filtering |
| `GET` | `/api/applications/{id}` | Fetches application details with associated ScrutinyReport |
| `PATCH` | `/api/applications/{id}/status` | Updates application status (`APPROVED`, `REJECTED`, etc.) |
| `POST` | `/api/applications/verify-architect` | Verifies architect license against CoA India & RERA via TinyFish |
| `POST` | `/api/rules/verify-source` | Scrapes official municipal bye-law citations via TinyFish |
| `GET` | `/api/rules` | Retrieves all active statutory bye-laws stored in database |

---

## 🔒 Security & Data Integrity

- **Deterministic Compliance Guarantee**: AI models are strictly constrained to architectural dimension extraction and document parsing. All statutory pass/fail determinations are strictly calculated by the deterministic rule engine against verified municipal bye-laws.
- **Role-Based Access Control (RBAC)**: Strong cryptographic JWT access tokens and password hashing with `bcrypt`. Enforcement officer registrations require administrative sign-off before portal access is granted.
- **Client-Side Document Export**: PDF generation is performed client-side using `jspdf` and includes unique SHA-256 digital verification hashes for document traceability.
- **Local Fallback & Credential Safety**: Works seamlessly with SQLite when no cloud DB is configured; all sensitive API keys and secrets are isolated in `backend/.env` and excluded from Git tracking.
