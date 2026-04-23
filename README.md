# Compass

**Compass helps Canton institutions benchmark treasury and collateral performance privately, without exposing raw positions.**

Compass is a privacy-preserving institutional intelligence product for repo and treasury activity on Canton. It allows institutions to contribute selected benchmark fields, generate trust-weighted benchmark intelligence, compare institution-level positioning against the active cohort, and produce auditable outputs without exposing raw proprietary positions.

The current repository includes a working multi-role MVP flow for **Institution Desk**, **Operator**, and **Auditor**, backed by a FastAPI service, projection-based read models, and a Daml/Canton workflow skeleton.

## Problem / Solution / Why Canton

| Category | Summary |
| --- | --- |
| Problem | Institutional crypto treasury and operations teams struggle to compare liquidity, collateral structure, and repo posture to peers because privacy-first workflows fragment market intelligence. |
| Solution | Compass collects selected contribution fields, processes them confidentially, and produces trust-weighted benchmark intelligence plus institution-scoped comparison outputs without exposing raw positions. |
| Why Canton | Canton is built for privacy-first institutional workflows, selective disclosure, and auditable business processes, which makes it the right foundation for contribution policies, benchmark lifecycle control, and recorded intelligence outputs. |

## Current MVP Status

### Implemented

- Multi-role frontend shell
- Institution Desk working happy path
- Operator workflow path
- Auditor evidence path
- FastAPI backend with role-specific endpoints
- Projection-oriented service layer
- Seed-backed benchmark, processing, institution output, and audit state
- Daml/Canton workflow skeleton for authority, disclosure, release, and audit lifecycle

### Not yet implemented

- Persistent database storage
- Live Canton event ingestion
- Live Daml command submission bridge
- Production-grade confidential compute integration
- Full export/evidence package workflow

## Product Workflow

Compass is repo-native, treasury-aware, and deterministic first. It is not a retail analytics app and it is not positioned as autonomous AI.

The current product flow is organized around five core screens:

1. **Network Intelligence Overview**  
   Show that privacy-preserving contribution can still generate network-wide signals.

2. **Contribution Campaign**  
   Define what institutions are asked to contribute and how contribution quality affects benchmark strength.

3. **Confidential Processing**  
   Explain the trusted execution model and deterministic processing boundary.

4. **Benchmark Intelligence**  
   Surface anonymized aggregate signals and benchmark reliability.

5. **My Position Intelligence**  
   Compare one institution to the benchmark and produce an auditable, local explainable summary.

## Role Model

### Institution Desk

Submits benchmark contributions, reviews institution-relative benchmark output, and records auditable outputs.

### Operator

Reviews contribution quality, controls benchmark processing, manages release readiness, and oversees institution output flow.

### Auditor

Inspects evidence, attestation references, release scope, retention policy status, and audit record integrity.

## Repository Structure

```text
.
|-- README.md
|-- LICENSE
|-- .gitignore
|-- docs/
|-- frontend/
|-- services/
|-- canton/
`-- quickstart/
```

### Key folders

- `frontend/`: Vite frontend with role-aware Compass UI.
- `services/crti-api/`: FastAPI backend with projections, role-specific services, and seed-backed MVP state.
- `canton/`: Daml workflow skeleton for campaign, contribution, processing, release, institution output, and audit lifecycle.
- `quickstart/`: Canton runtime / integration area for future network attachment.

See [PROJECT_LAYOUT.md](docs/PROJECT_LAYOUT.md) for a folder-by-folder breakdown.

## Quick Demo Instructions

1. Start the backend service.
2. Start the frontend.
3. Open Compass in the browser.
4. Walk the Institution Desk happy path:
   - Overview
   - Contribute
   - Submit Contribution
   - Processing
   - Benchmark
   - My Position
   - Record to Canton
5. Use the role switcher to inspect Operator and Auditor views.
6. Verify that role-specific backend endpoints are driving the current UI state.

## Frontend Instructions

From `frontend/`:

```bash
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` by default. If the backend is unavailable, the UI can still render fallback demo states for presentation purposes, but the intended path is the live seed-backed MVP flow.

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

The backend is currently seed-backed rather than fully persistent, but it powers the live MVP flows for Institution Desk, Operator, and Auditor. It includes role-specific endpoints, benchmark computation scaffolding, institution output generation, and audit handoff state transitions.

## Current API Surface

### Institution Desk

- `GET /api/desk/overview`
- `GET /api/desk/contribute/{campaignId}`
- `POST /api/desk/contribute/{campaignId}/submit`
- `GET /api/desk/processing/{runId}`
- `GET /api/desk/benchmark?scenario=...`
- `GET /api/desk/my-position?scenario=...`
- `POST /api/desk/my-position/{outputId}/record`

### Operator

- `GET /api/operator/overview`
- `GET /api/operator/campaigns/{campaignId}`
- `GET /api/operator/submissions/pending`
- `POST /api/operator/submissions/{submissionId}/review`
- `GET /api/operator/processing/{runId}`
- `POST /api/operator/processing/{campaignId}/trigger`
- `POST /api/operator/releases/{runId}/approve`
- `GET /api/operator/benchmark?scenario=...`
- `GET /api/operator/institution-output/{institutionId}`

### Auditor

- `GET /api/auditor/overview`
- `GET /api/auditor/campaigns/{campaignId}/policy`
- `GET /api/auditor/processing/{runId}/evidence`
- `GET /api/auditor/benchmark/{snapshotId}/audit`
- `GET /api/auditor/institution-output/{outputId}`
- `GET /api/auditor/audit-records/{recordId}`

Legacy presentation endpoints are still present for compatibility with earlier demo views, but the active MVP direction is the role-specific API surface above.

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

## Roadmap / Next Steps

- Move from seed-backed state to persistent database storage.
- Connect frontend fully across all role views to stable persisted data.
- Add backend-to-Daml command submission.
- Add Canton event ingestion and projection synchronization.
- Harden workflow state transitions and edge cases.
- Attach a real Canton runtime and upstream quickstart stack under `quickstart/`.
