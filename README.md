# Compass

Compass helps Canton institutions benchmark treasury and collateral performance privately, without exposing raw positions.

Institutions contribute selected benchmark fields. Compass returns anonymized peer benchmarks, institution-scoped comparisons, and audit-ready lifecycle records.

## Why It Matters

Private repo, treasury, and collateral workflows generate valuable intelligence that institutions cannot safely share. Compass turns that hidden activity into usable benchmark insight while keeping raw positions protected.

Compass is built for institutional RWA and capital-markets workflows where selective disclosure, lifecycle control, release governance, and audit evidence matter as much as the analytics.

## What Compass Does

- Collects selected benchmark contribution fields from institutions.
- Simulates confidential processing for benchmark computation.
- Produces trust-weighted cohort benchmark intelligence.
- Produces institution-scoped comparison outputs.
- Separates raw contribution data from operator, auditor, and peer views.
- Records released outputs with Canton-style audit references.
- Supports a role-based lifecycle across Institution Desk, Operator, and Auditor.

## Demo in 30 Seconds

1. Reset the demo state.
2. Institution Desk submits a prepared contribution package.
3. Simulated confidential processing produces benchmark outputs.
4. Operator reviews submissions, triggers processing, and releases the result.
5. Institution Desk records the released output and receives a Canton-style reference.
6. Auditor reviews policy evidence, benchmark audit, output audit, and the final Canton-style record.

Reset the demo state:

```bash
curl -X POST http://localhost:8000/api/dev/reset-demo-state
```

## Role-Based Workflow

### Institution Desk

- Reviews a prepared Alpha Bank contribution package.
- Submits privacy-safe benchmark fields into the simulated confidential processing flow.
- Views derived benchmark and institution-scoped comparison outputs.
- Records released output to receive a Canton-style audit reference such as `CANTON-REC-0001`.

### Operator

- Reviews submitted packages.
- Resolves pending submissions.
- Triggers benchmark processing after review gates pass.
- Reviews benchmark construction quality and release readiness.
- Approves release of derived outputs.

### Auditor

- Reviews policy evidence, benchmark audit, output audit, and audit records.
- Sees lifecycle state, release scope, attestation references, and record references.
- Does not receive raw Alpha Bank contribution values, raw peer positions, named peer breakdowns, or payload dumps.

## Current MVP Status

### Implemented

- Institution Desk happy path.
- Operator review, processing trigger, and release lifecycle.
- Auditor read-only evidence flow.
- Reset-to-finalized demo flow.
- Simulated TEE/confidential processing boundary.
- Canton-style record finalization with references such as `CANTON-REC-0001`.
- Role-aware frontend navigation and state-specific screens.
- Lifecycle-aware not-ready, ready, pending, released, and finalized states.
- Auditor projections sanitized to avoid raw data exposure.
- Stable benchmark summary metrics separated from latest processing-run evidence.
- FastAPI backend with role-specific endpoints.
- Projection-oriented backend services.
- Seed-backed benchmark, processing, institution output, and audit state.
- Prepared Alpha Bank contribution package with privacy-safe preview fields.
- Hardened lifecycle transitions for submissions, processing runs, releases, and audit records.
- Idempotent duplicate handling for Desk submissions, release approvals, and Record-to-Canton.
- Development reset endpoint for repeatable demos.
- Backend smoke tests covering Desk, Operator, and Auditor flows.
- SQLAlchemy repository boundary and Alembic persistence scaffold.
- Daml/Canton workflow skeleton and adapter seams for future command submission and event ingestion.

### Not Yet Implemented

- Production persistent database mode.
- Live bank-side connector.
- Live Canton event ingestion.
- Live Daml command submission bridge.
- Production-grade confidential compute / TEE integration.
- External real data integrations.
- Fully exportable evidence packages.

## How the MVP Simulates Production

The current repository is a seed-backed, simulation-driven MVP. It implements a working multi-role lifecycle, but it does not claim a production bank connector, production confidential compute deployment, or live Canton command submission.

The MVP flow is:

```text
Prepared contribution package
  -> Simulated TEE / confidential boundary
  -> Policy checks + deterministic benchmark computation
  -> Derived benchmark intelligence
  -> Institution-scoped output
  -> Canton-style audit reference
```

In production, banks would not manually type raw repo or treasury positions into Compass. A bank-side connector would extract only selected benchmark fields from treasury, collateral, risk, or warehouse systems. Exact values would be transformed before leaving the institution-side environment.

| Raw institutional input | Privacy-safe benchmark contribution |
|---|---|
| Exact repo notional | Bucketed notional range |
| Exact secured funding rate | Normalized funding value |
| Detailed collateral positions | Collateral concentration summary |
| Exact maturity profile | Maturity bucket |
| Liquidity inputs | Policy-normalized benchmark field |

Only derived outputs are released:

- Benchmark reliability package.
- Cohort-level benchmark metrics.
- Dispersion indicators.
- Attested coverage.
- Institution-scoped comparison outputs.
- Attestation references.
- Audit record references.

See [docs/MVP_NOTES.md](docs/MVP_NOTES.md) for simulation boundaries, production caveats, and future integration seams.

## Run the Demo

### Backend

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

### Frontend

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

## API Surface

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
- `GET /api/auditor/campaigns/:campaignId/policy`
- `GET /api/auditor/processing/:runId/evidence`
- `GET /api/auditor/benchmark/:snapshotId/audit`
- `GET /api/auditor/institution-output/:outputId`
- `GET /api/auditor/audit-records/:recordId`

### Development

- `POST /api/dev/reset-demo-state`

## Verification

Latest validated checks:

```bash
npm run build
python -m pytest tests/test_smoke_flows.py
```

Also validated:

- Custom reset-to-finalized lifecycle script passed.
- Static check for hash-only anchors passed.
- Auditor mutation endpoint usage absent.
- Auditor raw data projection safety checked.
- `datetime.utcnow()` deprecation warnings removed from backend tests.

Backend smoke tests cover:

- Institution Desk read, submit, processing, benchmark, position, and record flow.
- Operator overview, pending submission review, processing trigger, release approval, and institution output review.
- Auditor overview, policy evidence, benchmark audit, output audit, and audit record detail.
- Auditor cross-screen finalized context consistency for record reference, output id, run id, attestation reference, and lifecycle state.
- Stable Auditor benchmark summary metrics after new processing run release.
- Run-level evidence isolation in processing-specific projections.
- Policy Evidence and Auditor evidence modal key/value formatting.

## Architecture Notes

Compass is repo-native, treasury-aware, and deterministic first. It is not a retail analytics app and it is not positioned as autonomous AI.

The `canton/` package contains a workflow-oriented Daml skeleton for Compass, covering:

- Campaign lifecycle.
- Contribution submission.
- Submission review.
- Processing runs.
- Benchmark release.
- Institution-scoped outputs.
- Attestation references.
- Audit records.

Analytics remain off-ledger. Daml/Canton is used for workflow authority, role-based disclosure, lifecycle state, release control, attestation references, and audit-worthy records. Heavy computation, benchmark scoring, reliability scoring, and projection generation are handled by the FastAPI backend.

The current Daml layer is implementation-ready scaffolding. Backend bridge seams are intentionally left as TODOs for Canton event ingestion, Daml command submission, projection synchronization, and record finalization handshakes.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DEMO_FLOW.md](docs/DEMO_FLOW.md), and [docs/PROJECT_LAYOUT.md](docs/PROJECT_LAYOUT.md) for deeper technical notes.

## Repository Structure

```text
.
|-- README.md
|-- LICENSE
|-- docs/
|-- frontend/
|-- services/
|-- canton/
`-- quickstart/
```

Key folders:

- `frontend/` -> Vite frontend with role-aware Compass UI.
- `services/crti-api/` -> FastAPI backend with projections, role-specific services, lifecycle guards, and seed-backed MVP state.
- `services/crti-api/app/ledger.py` -> Canton/Daml adapter seams.
- `services/crti-api/alembic/` -> persistence migration scaffold.
- `canton/` -> Daml workflow skeleton for campaign, contribution, processing, release, institution output, and audit lifecycle.
- `quickstart/` -> Canton runtime / integration area for future network attachment.

## Roadmap

- Move from seed-backed state to persistent database storage.
- Complete PostgreSQL-backed repository implementation.
- Add live bank-side connector design and sample adapter.
- Add backend-to-Daml command submission.
- Add Canton event ingestion and projection synchronization.
- Attach a live Canton runtime under `quickstart/`.
- Add production-grade confidential compute / TEE integration.
- Add external real data integrations.
- Add exportable audit/evidence packages.
