# 🌱 SmartSeason v2

Intelligent field monitoring platform for tracking crop progress, coordinating field agents, and monitoring farm health across a growing season.

---

## Project Structure

```
smartseason/
├── backend/       FastAPI + MongoDB Atlas   → Deploy on Render
├── email-api/     FastAPI + Resend          → Deploy on Vercel
├── frontend/      Vite + React + TypeScript → Deploy on Vercel (field agents + landing page)
├── admin/         Vite + React + TypeScript → Deploy on Vercel (admin/coordinator dashboard)
├── MOCK_DATA.md   Test data and expected outcomes
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account 

---

### 1 — Backend (Render)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # Fill in all values
uvicorn main:app --reload   # Runs on :8000
```

**Environment variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ | MongoDB Atlas connection string |
| `DB_NAME` | ✅ | Database name (default: `smartseason`) |
| `SECRET_KEY` | ✅ | Long random string for JWT signing |
| `EMAIL_API_URL` | ✅ | URL of deployed email-api on Vercel |
| `EMAIL_API_SECRET` | ✅ | Shared secret between backend and email-api |
| `FRONTEND_URL` | ✅ | Field agent app URL (for CORS + email links) |
| `ADMIN_URL` | ✅ | Admin dashboard URL (for CORS + email links) |

**Render deployment:**
1. Connect GitHub repo → set Root Directory to `backend`
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all env vars in Render dashboard

---

### 2 — Email API (Vercel)

The email-api is a **separate Python FastAPI app** hosted on Vercel via the Mangum ASGI adapter. The backend never sends emails directly — Render's outbound email delivery is unreliable, so all email is delegated here.

```bash
cd email-api
pip install -r requirements.txt
cp .env.example .env.local
# Local dev: uvicorn main:app --port 3001
```

**Environment variables:**

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | From resend.com dashboard |
| `FROM_EMAIL` | Verified sender (e.g. `noreply@smartseason.app`) |
| `FROM_NAME` | Display name (`SmartSeason`) |
| `API_SECRET` | Must match backend's `EMAIL_API_SECRET` |

**Vercel deployment:**
```bash
cd email-api && vercel
```
Add env vars in Vercel project settings.

---

### 3 — Frontend — Field Agent + Landing Page (Vercel)

```bash
cd frontend
npm install
cp .env.example .env.local
# VITE_API_URL=https://your-backend.onrender.com/api
# VITE_ADMIN_URL=https://smartseason-admin.vercel.app
npm run dev   # :5173
```

Routes:
- `/` → Landing page (public)
- `/login`, `/register` → Agent auth
- `/dashboard`, `/fields`, `/fields/:id` → Agent app (protected)
- `/profile`, `/settings` → Agent profile (protected)

---

### 4 — Admin Dashboard (Vercel)

```bash
cd admin
npm install
cp .env.example .env.local
# VITE_API_URL=https://your-backend.onrender.com/api
npm run dev   # :5174
```

Routes: `/dashboard`, `/fields`, `/fields/:id`, `/agents`, `/profile`, `/settings`



## API Reference

### Auth
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register + send welcome + verify email | Public |
| POST | `/api/auth/login` | Login, receive JWT | Public |
| POST | `/api/auth/verify-email` | Verify email with token | Public |
| POST | `/api/auth/resend-verification` | Resend verification email | JWT |
| POST | `/api/auth/forgot-password` | Send password reset email | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |
| GET  | `/api/auth/me` | Current user info | JWT |

### Profile
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/profile/` | Get own profile |
| PATCH  | `/api/profile/` | Update name, phone, bio, notif_pref |
| POST   | `/api/profile/change-password` | Change password |
| DELETE | `/api/profile/account` | Delete own account |

### Fields
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET  | `/api/fields/` | List fields (scoped by role) | JWT |
| POST | `/api/fields/` | Create field | Admin |
| GET  | `/api/fields/dashboard` | Dashboard stats | JWT |
| GET  | `/api/fields/:id` | Field detail | JWT |
| PATCH| `/api/fields/:id` | Update field | Admin |
| DELETE| `/api/fields/:id` | Delete field | Admin |

### Updates, Notifications — standard CRUD, see `backend/routers/`

---

## Design Decisions

### 1. Four-folder structure
- `backend/` — API logic, one place
- `email-api/` — email-only microservice, deployed separately because Render's outbound email delivery is unreliable
- `frontend/` — field agent app and landing page in one Vite app (same audience, same deployment)
- `admin/` — coordinator dashboard, separate deployment with role enforcement

### 2. Single CSS file per app
Each frontend has exactly one `src/index.css`. All component styles, layout, and utilities live there. No per-page CSS files, no CSS modules, no styled-components. This keeps the project simple and avoids import hell.

### 3. Minimal page files
Each app has two page files: `AuthPages.tsx` (all auth flows) and `AppPages.tsx` (all app pages). This eliminates dozens of tiny files without sacrificing readability.

### 4. Status computed at read time, never stored
`FieldStatus` is calculated fresh on every API response in `status_logic.py`. This ensures accuracy without background jobs — a field neglected for 14 days becomes "At Risk" automatically on the next request.

### 5. Argon2id over bcrypt
Argon2id is the OWASP Password Hashing Competition winner. It is memory-hard (resistant to GPU brute-force) and is the current OWASP recommendation for new systems. Parameters: time_cost=2, memory=64MB, parallelism=2.


### 7. Email as a separate Python service on Vercel
Rather than a Next.js service, the email-api is a pure Python FastAPI app using Mangum (the ASGI→Lambda adapter that Vercel uses). This keeps the whole stack in Python for the backend team, and avoids context-switching to TypeScript/Node just for email.

### 8. Database API
Database used for storage is MongoDB
The platform uses an API for MongoDB Atlas string
However switching to other databases like MySQL or Postgre is possible by just change the database block file.

---

## Assumptions

1. **Single organisation** — All admins see all fields. There is no multi-tenant isolation.
2. **Email delivery optional** — If `EMAIL_API_URL` is not set, the backend logs a warning and continues.         Registration and auth still work; emails are simply skipped.
   **Email functionality** — The email-api is built around Resend's Python SDK. Switching to SendGrid or SMTP would require changing `email-api/main.py` only. But at the moment email-api code is not hosted, only works locally.

3. **Health score is optional** — Agents can submit updates without a health score. Status falls back to time-based rules only.
4. **No file uploads** — Profile photos and field images are not supported. Avatar initials are used instead.
5. **One active role per account** — A user is either an admin or an agent; mixed roles are not supported.
6. **Nairobi timezone is fixed** — All dates are displayed in EAT. International timezone support is not implemented.

---

## Tech Stack

| Layer | Tech | Reason |
|-------|------|--------|
| API | FastAPI (Python) | Async, typed, great DX |
| Database | MongoDB Atlas + Motor | Flexible schema, TTL indexes for token expiry |
| Password hashing | Argon2id (argon2-cffi) | OWASP recommended |
| JWT | python-jose | Standard FastAPI pattern |
| Email sending | Resend | Reliable|
| Email hosting | Vercel + Mangum | Separate from Render, Python-native |
| Frontend | Vite + React 18 + TypeScript | Fast HMR, strong typing |
| Charts | Recharts (admin only) | Composable, React-native |
| Timezone | pytz + date-fns-tz | Full IANA timezone support |
| Backend hosting | Render | Python support |
| Frontend hosting | Vercel | Fast deploys, CDN|


## ==== DEMO CREDENTIALS =====
Use the admin details below to login to admin portal.
Use the agent details below to login to field agent portal.

> Admin 
    Name: Alice Keya  
    Email: alicekeya@smartseason.app 
    Password:Test1234!

> Agents
    Name: Bob Kamau
    Email: bob@smartseason.app
    Password: Test1234!

    Name: Carol Smith
    Email: carolsmith@smartseason.app
    Password: Test1234!