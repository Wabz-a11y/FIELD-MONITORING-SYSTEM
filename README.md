# 🌾 SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

---

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18 + TypeScript + Vite          |
| Backend   | Python + FastAPI                      |
| Database  | MongoDB (via Motor async driver)      |
| Auth      | JWT (python-jose) + bcrypt (passlib)  |
| Charts    | Recharts                              |
| Fonts     | Syne (display) + DM Sans (body)       |

---

## Features

### Roles & Access
- **Admin (Coordinator)** — Full access: create/edit/delete fields, assign agents, view all data, monitor all updates
- **Field Agent** — Scoped access: view and update only assigned fields

### Field Management
- Create fields with name, crop type, planting date, location, size, and agent assignment
- Edit and delete fields (admin only)
- Assign/reassign fields to field agents

### Field Lifecycle
```
Planted → Growing → Ready → Harvested
```
Stage transitions are driven by field agents through the update log.

### Field Status Logic
Each field's status is computed dynamically at read time:

| Condition | Status |
|---|---|
| Stage is `harvested` | ✅ **Completed** |
| Latest health score ≤ 4 | ⚠️ **At Risk** |
| Stage is `ready`, no update in >7 days | ⚠️ **At Risk** (overdue harvest) |
| Stage is `planted` or `growing`, no update in >14 days | ⚠️ **At Risk** (neglected field) |
| Days since planted > 1.5× expected for current stage | ⚠️ **At Risk** (behind schedule) |
| All other fields | 🌱 **Active** |

**Expected stage timelines:**
- `planted` → 0–14 days from planting
- `growing` → 15–60 days
- `ready`   → 61–75 days
- `harvested` → 76+ days

### Dashboard
- **Admin**: Total fields, status & stage breakdown charts, at-risk field list, recent activity feed across all agents
- **Agent**: Same view scoped to assigned fields only

### Field Updates
Agents log field observations including:
- Free-text notes
- Optional stage change
- Optional health score (1–10)

---

## Project Structure

```
smartseason/
├── backend/
│   ├── main.py              # FastAPI app entry + CORS
│   ├── database.py          # Motor async MongoDB client + index setup
│   ├── models.py            # All Pydantic v2 schemas
│   ├── auth_utils.py        # JWT creation/verification, bcrypt, auth deps
│   ├── status_logic.py      # Pure function: compute_field_status()
│   ├── seed.py              # Demo data seeder
│   ├── requirements.txt
│   ├── .env.example
│   └── routers/
│       ├── auth.py          # POST /register, /login, GET /me
│       ├── users.py         # GET /agents, /users (admin only)
│       ├── fields.py        # Full CRUD + GET /dashboard
│       └── updates.py       # POST / create update, GET /field/:id
│
└── frontend/
    ├── index.html
    ├── vite.config.ts       # Dev proxy: /api → localhost:8000
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx           # Routes + auth guards
    │   ├── index.css         # Design tokens (CSS variables), animations
    │   ├── types/index.ts    # Shared TypeScript interfaces
    │   ├── lib/api.ts        # Axios instance with JWT interceptors
    │   ├── hooks/
    │   │   └── useAuth.tsx   # Auth context (login, register, logout)
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── FieldsPage.tsx
    │   │   └── FieldDetailPage.tsx
    │   └── components/
    │       ├── Layout.tsx    # Sidebar + outlet
    │       └── UI.tsx        # StatusBadge, StageBadge, StatCard, etc.
    └── package.json
```

---

## Setup & Running

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend

```bash
cd backend

# Copy environment config
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed demo data
python seed.py

# Start the API server
uvicorn main:app --reload
```

API will be available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
```

App will be available at `http://localhost:5173`

> The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`, so no CORS issues during development.

---

## Demo Accounts (after seeding)

| Role  | Email              | Password   |
|-------|--------------------|------------|
| Admin | admin@farm.com     | password   |
| Agent | bob@farm.com       | password   |
| Agent | carol@farm.com     | password   |

---

## API Endpoints

### Auth
| Method | Path               | Description              | Access |
|--------|--------------------|--------------------------|--------|
| POST   | `/api/auth/register` | Create account          | Public |
| POST   | `/api/auth/login`    | Login, receive JWT      | Public |
| GET    | `/api/auth/me`       | Current user info        | Auth   |

### Fields
| Method | Path                   | Description                    | Access |
|--------|------------------------|--------------------------------|--------|
| GET    | `/api/fields/`          | List fields (scoped by role)   | Auth   |
| POST   | `/api/fields/`          | Create field                   | Admin  |
| GET    | `/api/fields/dashboard` | Dashboard stats                | Auth   |
| GET    | `/api/fields/:id`       | Get single field               | Auth   |
| PATCH  | `/api/fields/:id`       | Update field                   | Admin  |
| DELETE | `/api/fields/:id`       | Delete field                   | Admin  |

### Updates
| Method | Path                      | Description              | Access |
|--------|---------------------------|--------------------------|--------|
| POST   | `/api/updates/`            | Create field update      | Auth   |
| GET    | `/api/updates/field/:id`   | Get updates for a field  | Auth   |

### Users
| Method | Path              | Description         | Access |
|--------|-------------------|---------------------|--------|
| GET    | `/api/users/agents` | List all agents   | Admin  |
| GET    | `/api/users/`       | List all users    | Admin  |

---

## Design Decisions

### Status is computed, not stored
`FieldStatus` is never persisted to the database. It is calculated fresh on every read in `status_logic.py`. This ensures status is always accurate based on real-time factors (like elapsed days without updates) without requiring background jobs or triggers.

### Motor for async MongoDB
All database operations use `motor` (async MongoDB driver) to stay non-blocking within FastAPI's async event loop.

### Role enforcement at dependency level
FastAPI's `Depends()` system is used with `get_current_user` and `require_admin` guards. This keeps route handlers clean and makes access control easy to reason about and test.

### Health score as a risk signal
The 1–10 health score submitted by agents directly feeds into status computation. A score of ≤ 4 immediately flags the field as **At Risk**, giving agents a simple lever to escalate concerns that the automated time-based logic might not catch (e.g. pest outbreak on day 3).

---

## Environment Variables

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=smartseason
SECRET_KEY=your-super-secret-key-change-this-in-production
```
