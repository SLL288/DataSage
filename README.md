## Data Insights Starter

Mono-repo scaffold for a data insights product:
- Frontend: Next.js + Tailwind, charted with Chart.js via `react-chartjs-2`.
- Backend: FastAPI for file ingest, structure detection, insights/anomaly stubs.
- DB: Postgres-ready config surface (no migrations run here).
- Integrations: placeholders for Google Sheets, Shopify, Stripe, and GPT-5.

### Layout
- `frontend/`: Next.js app with upload/connect flow, dashboard mock, alerts, weekly summary preview.
- `backend/`: FastAPI service with CSV ingest, heuristic metric detection, mock AI insight generation.

### Quick start (local dev)
1) Backend  
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2) Frontend (separate terminal)  
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3) Visit http://localhost:3000. The frontend defaults to the hosted API `https://datasage-api.onrender.com`; override via `.env.local` with `NEXT_PUBLIC_API_BASE=http://localhost:8000` for local backend.

### Notes
- All integrations are stubbed; wire real credentials and persistence as needed.
- Sandbox-safe defaults: no external calls are made at runtime without keys.
- Extend `backend/app/main.py` for DB writes and GPT-5 calls; update `frontend/src/lib/api.ts` to match.***
