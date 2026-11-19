# SmartHCM — Enterprise Human Capital & Labor Management

A production-grade, secure, and modern Human Capital Management (HCM) system built with a **Django REST Framework** backend and a **Next.js 16 (App Router + TypeScript + Tailwind CSS)** frontend. Designed for enterprise employee directory operations, contract tracking, temporary labor logging, and seamless deployment on **Railway**.

---

## 🚀 Key Highlights & UX Features

- **Modern & Intuitive UX**:
  - **KPI Dashboard**: Real-time summary cards for Total Workforce, Permanent Staff (Active vs Terminated), Contract Staff (Active vs Expiring in 30 days), and Temporary Workers & Logs.
  - **Financial Metrics**: Monthly payroll expenditure tracking formatted in Ethiopian Birr (`Br 45,000 ETB`).
  - **Fast Multi-Tier Tab Navigation**: Filter seamlessly across *All Workforce*, *Permanent*, *Contract*, and *Temporary*.
  - **Instant Search & Filtering**: Client/server debounced search across names, employee codes, departments, roles, and phone numbers.
  - **Dynamic Employee Modals**: Context-aware input forms tailored to employment classification (e.g. contract end dates, permanent termination reasons, temporary logging).
  - **Full Employee Detail Drawer**: Slide-over profile inspection with identity, tax (TIN), shift, contact, and work log history.
  - **Temporary Labor Logging**: Track daily, weekly, or monthly work values (hours or Birr) and notes for temporary workers.
  - **Termination Workflow**: Safe termination and reactivation actions with reason tracking and confirmation dialogs.
  - **Data Portability**: Instant one-click CSV export of workforce data.
  - **Dual View Modes**: Switch between detailed tabular view and visual responsive cards.

- **Backend Security Hardening**:
  - **CORS & CSRF Protection**: Strict origins whitelist configured via environment variables (`django-cors-headers`).
  - **API Rate Limiting & Throttling**: DRF rate limiting (180 req/min for anonymous, 600 req/min for authenticated).
  - **Security Headers & HSTS**: Strict `X-Frame-Options: DENY`, `SECURE_CONTENT_TYPE_NOSNIFF`, `SECURE_BROWSER_XSS_FILTER`, and HTTP Strict Transport Security (HSTS) with 1-year preload in production.
  - **Unprivileged Container Execution**: Docker container runs as non-root `appuser`.
  - **SQL & Parameter Validation**: Automated ORM escaping and strict serializer schema validation.
  - **Automated Health Monitoring**: Dedicated `/api/health/` endpoint validating database availability for Railway and container orchestrators.
  - **OpenAPI 3.0 Documentation**: Interactive Swagger UI at `/api/docs/` and ReDoc at `/api/redoc/`.

- **Railway & CI/CD Pipeline Ready**:
  - Multi-stage production Dockerfiles for both Backend and Frontend.
  - Automated database migration and static asset collection on startup (`entrypoint.sh`).
  - Native `railway.json` configuration for zero-friction Railway deployments.
  - Full **GitHub Actions CI/CD workflow** (`.github/workflows/ci.yml`) testing Django migrations, test suites, and Next.js builds on every push/PR.

---

## 📁 Project Structure

```
SmartHCM/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated CI/CD pipeline
├── backend/
│   ├── base/                      # Core HCM domain app
│   │   ├── models.py              # Permanent, Contract, Temporary models & logs
│   │   ├── serializers.py         # DRF & OpenAPI schema serializers
│   │   ├── views.py               # REST API endpoints & viewsets
│   │   ├── urls.py                # App routing
│   │   ├── admin.py               # Django Admin configuration
│   │   └── tests.py               # Automated test suite
│   ├── SMART_HCM/                 # Django project settings & WSGI/ASGI
│   ├── Dockerfile                 # Hardened Python 3.12 production image
│   ├── entrypoint.sh              # Migration & Gunicorn startup script
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router (page.tsx, layout.tsx)
│   │   ├── components/            # UI components (Navbar, Tables, Modals, Drawers)
│   │   ├── lib/                   # API client (api.ts)
│   │   └── types/                 # TypeScript interfaces
│   ├── Dockerfile                 # Multi-stage standalone Next.js image
│   ├── package.json
│   ├── next.config.ts
│   └── .env.example               # Frontend environment template
├── compose.yaml                   # Local & staging Docker Compose orchestrator
├── Dockerfile                     # Root Railway build fallback
├── railway.json                   # Railway project deployment manifest
└── README.md
```

---

## 🛠️ Local Development Setup

### Option 1: Using Docker Compose (Recommended)

Spins up PostgreSQL, Django REST backend, and Next.js frontend with a single command:

```bash
docker compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Swagger Docs**: http://localhost:8000/api/docs/
- **Health Check**: http://localhost:8000/api/health/

---

### Option 2: Running Without Docker

#### 1. Backend (Django)
```bash
cd backend

# Create virtual environment and activate
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run automated tests
python manage.py test base

# Start API server
python manage.py runserver 8000
```

#### 2. Frontend (Next.js)
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Visit http://localhost:3000 in your browser.

---

## 🚆 Railway Deployment Guide

This repository is optimized for deployment on [Railway](https://railway.app).

### Step 1: Add PostgreSQL Database
1. In your Railway project, click **New** → **Database** → **Add PostgreSQL**.
2. Railway will automatically provision a database and generate a `DATABASE_URL` environment variable.

### Step 2: Deploy Backend Service
1. Click **New** → **GitHub Repo** → select `SmartHCM`.
2. Go to **Settings** → **Service Name**: set to `backend`.
3. Set **Root Directory** to `backend` (or leave default `/` which uses the root Dockerfile).
4. In the **Variables** tab, add:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (link from Railway PostgreSQL)
   - `SECRET_KEY`: `<Generate a random 64-character secret string>`
   - `DEBUG`: `0`
   - `ALLOWED_HOSTS`: `localhost,127.0.0.1,.railway.app`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-service.up.railway.app`
   - `CSRF_TRUSTED_ORIGINS`: `https://*.railway.app`
5. Railway will run `entrypoint.sh`, execute migrations automatically, and start Gunicorn on the port assigned by Railway.

### Step 3: Deploy Frontend Service
1. Click **New** → **GitHub Repo** → select `SmartHCM`.
2. Go to **Settings** → **Service Name**: set to `frontend`.
3. Set **Root Directory** to `frontend`.
4. In the **Variables** tab, add:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.up.railway.app`
5. Under **Networking**, click **Generate Domain** to get a public URL (e.g. `https://frontend-production-xxxx.up.railway.app`).
6. Update `CORS_ALLOWED_ORIGINS` in your backend service with this frontend URL.

---

## 🔒 Security Best Practices Implemented

| Security Concern | Implementation Detail |
| :--- | :--- |
| **Cross-Origin Requests (CORS)** | `django-cors-headers` with whitelist loaded strictly from environment variables |
| **Cross-Site Scripting (XSS)** | `SECURE_BROWSER_XSS_FILTER = True` & automatic React/Next.js output escaping |
| **Clickjacking** | `X_FRAME_OPTIONS = 'DENY'` |
| **MIME Sniffing** | `SECURE_CONTENT_TYPE_NOSNIFF = True` |
| **SSL Enforcement & HSTS** | `SECURE_HSTS_SECONDS = 31536000` with subdomains and preload enabled |
| **API Throttling** | DRF `AnonRateThrottle` (180/min) and `UserRateThrottle` (600/min) |
| **Privilege Separation** | Containers run under unprivileged system user `appuser` / `nextjs` |
| **Database Injection** | Django parameter-bound ORM queries with zero raw string interpolation |

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
python manage.py test base
```

Run frontend typecheck and build:
```bash
cd frontend
npm run build
```
