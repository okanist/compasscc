# Compass

**Compass helps Canton institutions benchmark treasury and collateral performance privately, without exposing raw positions.**

Compass is a privacy-preserving institutional intelligence product for repo, treasury, and collateral workflows on Canton. It lets institutions contribute selected benchmark fields, process them through a confidential computation workflow, generate trust-weighted benchmark intelligence, compare institution-level positioning against the active cohort, and produce auditable outputs without exposing raw proprietary positions.

The current repository includes a working multi-role MVP across **Institution Desk**, **Operator**, and **Auditor** workflows. The FastAPI backend serves role-specific projection views, supports benchmark computation and institution-level outputs, and includes hardened lifecycle transitions for contribution, processing, release, and audit record states. The demo is seed-backed for repeatability, while the repository includes SQLAlchemy/Alembic persistence scaffolding and Canton/Daml adapter seams for future live ledger integration.

The MVP uses a prepared Alpha Bank contribution package and a simulated TEE/confidential processing boundary. This is intentional: the demo focuses on the workflow, privacy model, benchmark computation, lifecycle state, and auditability rather than claiming a production bank connector or production confidential compute deployment.

---

## Problem / Solution / Why Canton

| Category | Summary |
|---|---|
| Problem | Institutions participating in private repo, treasury, and collateral workflows need better benchmark intelligence, but raw positions are commercially sensitive and cannot be shared broadly. |
| Solution | Compass turns selected benchmark contribution fields into trust-weighted benchmark intelligence and institution-scoped comparison outputs without exposing raw positions to peers, operators, auditors, or general benchmark viewers. |
| Why Canton | Canton is designed for privacy-first institutional workflows, selective disclosure, and auditable business processes. That makes it a strong foundation for contribution policies, benchmark lifecycle control, role-based visibility, release state, and recorded intelligence outputs. |

---

## Canton / RWA Context

Compass is positioned for the institutional RWA and capital-markets direction that Canton is already targeting: tokenized collateral mobility, financing workflows, treasury and balance-sheet optimization, repo-related workflows, selective disclosure, and auditable settlement processes.

Compass does **not** assume that every bank's internal treasury dataset already lives on Canton. Instead, Compass is designed as an intelligence layer around these workflows:

1. institutions contribute selected benchmark fields;
2. raw institutional positions remain protected;
3. confidential computation produces derived benchmark outputs;
4. Canton/Daml records workflow state, disclosure, release control, and audit-worthy lifecycle events.

In short: Canton provides the privacy-aware institutional workflow fabric; Compass adds a benchmark intelligence layer for treasury, repo, and collateral performance.

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
- Prepared Alpha Bank contribution package with privacy-safe preview fields
- Lifecycle-aware contribution submission flow
- Simulated TEE/confidential processing boundary for the MVP demo
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
- Live bank-side data connector
- Live Canton event ingestion
- Live Daml command submission bridge
- Production-grade confidential compute / TEE integration
- Full export/evidence packaging workflow

---

## Product Workflow

Compass is repo-native, treasury-aware, and deterministic first. It is not a retail analytics app and it is not positioned as autonomous AI.

The product flow is organized around five core screens:

1. **Network Intelligence Overview**  
   Shows that privacy-preserving contribution can still generate network-wide benchmark intelligence.

2. **Contribution Campaign**  
   Lets the Institution Desk review a prepared contribution package, confirm the contribution assurance class, and submit selected benchmark fields without exposing full raw positions.

3. **Confidential Processing**  
   Shows how selected contribution fields move through a simulated TEE/confidential processing boundary before derived outputs are released.

4. **Benchmark Intelligence**  
   Surfaces anonymized aggregate signals, benchmark reliability, cohort depth, and scenario-level intelligence.

5. **My Position Intelligence**  
   Compares one institution to the benchmark and produces an auditable, institution-scoped explainable summary.

---

## Real-World Data Flow

In a production deployment, institutions would not manually type full raw repo or treasury positions into Compass. Raw data would remain inside the bank's own treasury, collateral management, risk, or internal data warehouse systems.

A bank-side connector or adapter would extract only the selected benchmark fields required by an active campaign. Before leaving the institution-side environment, those fields would be transformed into privacy-safe benchmark inputs. For example:

| Raw institutional input | Privacy-safe benchmark contribution |
|---|---|
| Exact repo notional | Bucketed notional range |
| Exact secured funding rate | Normalized funding rate |
| Detailed collateral inventory | Collateral concentration summary |
| Exact maturity dates | Average maturity bucket |
| Internal liquidity ratio | Policy-normalized liquidity input |

The result is a **contribution package**, not a full raw position dump. Depending on the assurance level, the package may be self-reported, system-signed, or externally attested.

In a production version, this package would be sent into a confidential compute or TEE boundary for deterministic benchmark computation. The confidential boundary would perform:

- policy validation
- field eligibility checks
- trust weighting
- cohort aggregation
- outlier handling
- benchmark score calculation
- reliability scoring
- institution-scoped comparison

Raw institutional positions are not released to peers, operators, auditors, or benchmark viewers. Compass releases derived intelligence only, such as:

- benchmark reliability scores
- cohort-level benchmark metrics
- dispersion indicators
- attested coverage
- institution-scoped comparison outputs
- attestation references
- audit record references

Canton/Daml is used for workflow authority, role-based disclosure, lifecycle state, release control, and audit-worthy records. Heavy analytics and raw data processing remain off-ledger by design.

---

## MVP Simulation Note

The current hackathon MVP uses a seed-backed prepared contribution package for Alpha Bank. The Institution Desk reviews privacy-safe package fields, selects or confirms the contribution assurance class, and submits the package for confidential processing.

The TEE/confidential processing boundary is simulated through backend projections and UI state. The simulation is used to demonstrate the intended production workflow:

```text
Prepared contribution package
        ↓
Simulated TEE / confidential boundary
        ↓
Policy checks + deterministic benchmark computation
        ↓
Derived benchmark intelligence
        ↓
Institution-scoped output
        ↓
Canton-style audit reference
```

The current Daml workflow templates model campaign, submission, processing, release, institution output, attestation, and audit record lifecycles. Future integration seams exist for live Canton event ingestion, Daml command submission, projection synchronization, and production confidential compute execution.

---

## Role Model

### Institution Desk

Reviews and submits the institution's prepared contribution package, follows confidential processing state, reviews institution-relative benchmark output, and records auditable outputs.

### Operator

Reviews contribution quality, controls benchmark processing, manages release readiness, and oversees institution output flow.

### Auditor

Inspects evidence, attestation references, release scope, retention policy status, and audit record integrity.

---

## Working Demo Flow

The main demo path is:

1. Start as **Institution Desk**
2. Open Overview
3. Confirm the active contribution card shows a prepared package ready to submit
4. Go to Contribute Data
5. Review the privacy-safe contribution package
6. Submit the package into the simulated TEE/confidential processing boundary
7. View Confidential Processing state
8. Open Benchmark Intelligence
9. Open My Position Intelligence
10. Click Record to Canton
11. Switch to Operator to inspect workflow state
12. Switch to Auditor to inspect evidence, release scope, and audit record state

The demo can be reset through the development reset endpoint:

```bash
curl -X POST http://localhost:8000/api/dev/reset-demo-state
```

After reset, the Institution Desk demo starts with Alpha Bank's contribution package prepared but not yet submitted.

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

Analytics remain off-ledger by design. Benchmark computation, reliability scoring, projections, and interpretation are handled in the backend, while Daml/Canton is used for workflow authority, role-based disclosure, lifecycle control, release control, and auditable state.

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
- Add live bank-side connector design and sample adapter
- Add backend-to-Daml command submission
- Add Canton event ingestion and projection synchronization
- Attach a live Canton runtime under `quickstart/`
- Add production-grade confidential compute / TEE integration
- Add exportable audit/evidence packages
