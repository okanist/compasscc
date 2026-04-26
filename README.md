# Compass

**Compass helps Canton institutions benchmark treasury and collateral performance privately, without exposing raw positions.**

Compass is a privacy-preserving institutional intelligence product for repo and treasury activity on Canton. It allows institutions to contribute selected benchmark fields, generate trust-weighted benchmark intelligence, compare institution-level positioning against the active cohort, and produce auditable outputs without exposing raw proprietary positions.

The current repository includes a working multi-role MVP across **Institution Desk**, **Operator**, and **Auditor** workflows. The FastAPI backend serves role-specific projection views, supports benchmark computation and institution-level outputs, and includes hardened lifecycle transitions for contribution, processing, release, and audit record states. The demo is seed-backed for repeatability, while the repository includes SQLAlchemy/Alembic persistence scaffolding and Canton/Daml adapter seams for future live ledger integration.

---

## Problem / Solution / Why Canton

| Category | Summary |
|---|---|
| Problem | Institutional crypto treasury and operations teams struggle to compare liquidity, collateral structure, and repo posture to peers because privacy-first workflows fragment market intelligence. |
| Solution | Compass collects selected contribution fields, processes them confidentially, and produces trust-weighted benchmark intelligence plus institution-scoped comparison outputs without exposing raw positions. |
| Why Canton | Canton is built for privacy-first institutional workflows, selective disclosure, and auditable business processes, which makes it the right foundation for contribution policies, benchmark lifecycle control, and recorded intelligence outputs. |

---

## Current MVP Status

### Implemented

- Multi-role frontend shell for Institution Desk, Operator, and Auditor
- Working Institution Desk happy path
- Working Operator workflow
- Working Auditor evidence/read flow
- FastAPI backend with role-specific endpoints
- Projection-oriented backend services
- Seed-backed benchmark, processing, institution output, and audit state
- Hardened lifecycle transitions for submissions, processing runs, releases, and audit records
- Idempotent duplicate handling for Desk submissions, release approvals, and Record-to-Canton
- Consistent API error handling
- Development reset endpoint for repeatable demos
- Backend smoke tests covering Desk, Operator, and Auditor flows
- SQLAlchemy repository boundary and Alembic persistence scaffold
- Daml/Canton workflow skeleton
- Canton/Daml adapter seams for future command submission and event ingestion

### Not yet implemented

- Fully persistent production database mode
- Live Canton event ingestion
- Live Daml command submission bridge
- Production-grade confidential compute integration
- Full export/evidence packaging workflow

---

## Product Workflow

Compass is repo-native, treasury-aware, and deterministic first. It is not a retail analytics app and it is not positioned as autonomous AI.

The product flow is organized around five core screens:

1. **Network Intelligence Overview**  
   Shows that privacy-preserving contribution can still generate network-wide benchmark intelligence.

2. **Contribution Campaign**  
   Defines what institutions are asked to contribute and how contribution quality affects benchmark strength.

3. **Confidential Processing**  
   Shows how selected contribution fields move through a controlled processing boundary before derived outputs are released.

4. **Benchmark Intelligence**  
   Surfaces anonymized aggregate signals, benchmark reliability, cohort depth, and scenario-level intelligence.

5. **My Position Intelligence**  
   Compares one institution to the benchmark and produces an auditable, institution-scoped explainable summary.

---

## Role Model

### Institution Desk

Submits benchmark contributions, reviews institution-relative benchmark output, and records auditable outputs.

### Operator

Reviews contribution quality, controls benchmark processing, manages release readiness, and oversees institution output flow.

### Auditor

Inspects evidence, attestation references, release scope, retention policy status, and audit record integrity.

---

## Working Demo Flow

The main demo path is:

1. Start as **Institution Desk**
2. Open Overview
3. Go to Contribute Data
4. Submit a contribution
5. View Confidential Processing state
6. Open Benchmark Intelligence
7. Open My Position Intelligence
8. Click Record to Canton
9. Switch to Operator to inspect workflow state
10. Switch to Auditor to inspect evidence, release scope, and audit record state

The demo can be reset through the development reset endpoint:

```bash
POST /api/dev/reset-demo-state
```

---

## Repository Structure

```text
.
├── README.md
├── LICENSE
├── .gitignore
├── docs/
├── frontend/
├── services/
├── canton/
└── quickstart/
```

### Key folders

- `frontend/` -> Vite frontend with role-aware Compass UI
- `services/crti-api/` -> FastAPI backend with projections, role-specific services, lifecycle guards, and seed-backed MVP state
- `services/crti-api/app/ledger.py` -> Canton/Daml adapter seams
- `services/crti-api/alembic/` -> persistence migration scaffold
- `canton/` -> Daml workflow skeleton for campaign, contribution, processing, release, institution output, and audit lifecycle
- `quickstart/` -> Canton runtime / integration area for future network attachment

See `PROJECT_LAYOUT.md` for a folder-by-folder breakdown.

---

## Frontend Instructions

From `frontend/`:

```bash
npm install
npm run dev
```

The frontend expects the backend at:

```text
http://localhost:8000
```

If the backend is unavailable, the UI can still render fallback demo states for presentation purposes, but the intended path is the live seed-backed MVP flow.

---

## Backend Service Instructions

From `services/crti-api/`:

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows PowerShell
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Helper scripts are included:

- Windows: `run-dev.ps1`
- Unix-like: `run-dev.sh`

The backend is currently seed-backed rather than fully persistent, but it powers the live MVP flows for Institution Desk, Operator, and Auditor.

---

## Current API Surface

### Institution Desk

- `GET /api/desk/overview`
- `GET /api/desk/contribute/:campaignId`
- `POST /api/desk/contribute/:campaignId/submit`
- `GET /api/desk/processing/:runId`
- `GET /api/desk/benchmark?scenario=...`
- `GET /api/desk/my-position?scenario=...`
- `POST /api/desk/my-position/:outputId/record`

### Operator

- `GET /api/operator/overview`
- `GET /api/operator/submissions/pending`
- `POST /api/operator/submissions/:submissionId/review`
- `GET /api/operator/processing/:runId`
- `POST /api/operator/processing/:campaignId/trigger`
- `POST /api/operator/releases/:runId/approve`
- `GET /api/operator/institution-output/:institutionId`

### Auditor

- `GET /api/auditor/overview`
- `GET /api/auditor/processing/:runId/evidence`
- `GET /api/auditor/benchmark/:snapshotId/audit`
- `GET /api/auditor/institution-output/:outputId`
- `GET /api/auditor/audit-records/:recordId`

### Development

- `POST /api/dev/reset-demo-state`

---

## Daml / Canton Workflow Notes

The `canton/` package contains a workflow-oriented Daml skeleton for Compass, covering:

- campaign lifecycle
- contribution submission
- submission review
- processing runs
- benchmark release
- institution-scoped outputs
- attestation references
- audit records

Analytics remain off-ledger by design. Benchmark computation, reliability scoring, projections, and interpretation are handled in the backend, while Daml/Canton is used for workflow authority, role-based disclosure, lifecycle control, and auditable state.

The current Daml layer is implementation-ready scaffolding. Backend bridge seams are intentionally left as TODOs for:

- Canton event ingestion
- Daml command submission
- projection synchronization
- record-to-Canton finalization handshake

---

## Verification

Current checks:

```bash
pytest
python -m compileall app
npm run build
```

Backend smoke tests cover:

- Institution Desk read, submit, processing, benchmark, position, and record flow
- Operator overview, pending submission review, processing trigger, release approval, and institution output review
- Auditor overview, processing evidence, benchmark audit, institution output audit, and audit record detail

---

## Roadmap / Next Steps

- Move from seed-backed state to persistent database storage
- Complete PostgreSQL-backed repository implementation
- Add backend-to-Daml command submission
- Add Canton event ingestion and projection synchronization
- Attach a live Canton runtime under `quickstart/`
- Add production-grade confidential compute integration
- Add exportable audit/evidence packages
