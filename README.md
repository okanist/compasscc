# Compass

**Compass helps Canton institutions benchmark treasury and collateral performance privately, without exposing raw positions.**

Compass is a privacy-preserving institutional intelligence product for repo, treasury, and collateral workflows on Canton. Institutions contribute selected benchmark fields, and Compass produces trust-weighted benchmark intelligence, institution-scoped comparison outputs, and audit-worthy lifecycle records.

The current repository is a seed-backed, simulation-driven MVP, but it implements a working multi-role lifecycle across **Institution Desk**, **Operator**, and **Auditor**. The FastAPI backend serves role-specific projections, supports benchmark computation and institution-level outputs, and enforces lifecycle transitions for contribution, processing, release, and audit record states.

The MVP uses prepared contribution packages, simulated TEE/confidential processing state, and Canton-style audit references. It does not claim a production bank connector, production confidential compute deployment, or live Canton command submission.

---

## Problem / Solution / Why Canton

| Category | Summary |
|---|---|
| Problem | Institutions participating in private repo, treasury, and collateral workflows need better benchmark intelligence, but raw positions are commercially sensitive and cannot be shared broadly. |
| Solution | Compass turns selected benchmark contribution fields into trust-weighted benchmark intelligence and institution-scoped comparison outputs without exposing raw positions to peers, operators, auditors, or general benchmark viewers. |
| Why Canton | Canton is designed for privacy-first institutional workflows, selective disclosure, and auditable business processes. That makes it a strong foundation for contribution policies, benchmark lifecycle control, role-based visibility, release state, and recorded intelligence outputs. |

---

## Canton / RWA Context

Compass is positioned for institutional RWA and capital-markets workflows: tokenized collateral mobility, financing workflows, treasury and balance-sheet optimization, repo-related workflows, selective disclosure, and auditable settlement processes.

Compass does **not** assume every bank's internal treasury dataset already lives on Canton. Compass is designed as an intelligence layer around these workflows:

1. Institutions contribute selected benchmark fields.
2. Raw institutional positions remain protected.
3. Confidential computation produces derived benchmark outputs.
4. Canton/Daml records workflow authority, role-based disclosure, lifecycle state, release control, attestation references, and audit-worthy records.

Analytics remain off-ledger by design. Heavy computation, benchmark scoring, reliability scoring, and projection generation are handled by the FastAPI backend.

---

## Current MVP Status

### Implemented

- Institution Desk full happy path
- Operator review, processing trigger, and release lifecycle
- Auditor read-only evidence flow
- Reset-to-finalized demo flow
- Simulated TEE/confidential processing boundary
- Canton-style record finalization with references such as `CANTON-REC-0001`
- Role-aware sidebar/navigation and footer identity
- Lifecycle-aware not-ready, ready, pending, released, and finalized states
- Auditor projections sanitized to avoid raw data exposure
- FastAPI backend with role-specific endpoints
- Projection-oriented backend services
- Seed-backed benchmark, processing, institution output, and audit state
- Prepared Alpha Bank contribution package with privacy-safe preview fields
- Hardened lifecycle transitions for submissions, processing runs, releases, and audit records
- Idempotent duplicate handling for Desk submissions, release approvals, and Record-to-Canton
- Development reset endpoint for repeatable demos
- Backend smoke tests covering Desk, Operator, and Auditor flows
- SQLAlchemy repository boundary and Alembic persistence scaffold
- Daml/Canton workflow skeleton and adapter seams for future command submission and event ingestion

### Not Yet Implemented

- Production persistent database mode
- Live bank-side connector
- Live Canton event ingestion
- Live Daml command submission bridge
- Production-grade confidential compute / TEE integration
- External real data integrations
- Fully exportable evidence packages

---

## Validated Demo Lifecycle

The final validated MVP flow is:

1. Reset demo state.
2. Institution Desk sees a prepared Alpha Bank contribution package.
3. Institution Desk submits a System-signed package.
4. Confidential Processing shows simulated TEE completed and `benchmark_ready=true`.
5. Benchmark & Insights shows derived cohort benchmark metrics.
6. My Position shows Alpha Bank's institution-scoped comparison output.
7. Operator reviews Alpha Bank, resolves Northline, triggers benchmark processing, and approves release.
8. Institution Desk records the released output and receives a Canton-style reference.
9. Auditor reviews Policy Evidence, Benchmark Audit, Output Audit, and Audit Record.

The demo can be reset through:

```bash
curl -X POST http://localhost:8000/api/dev/reset-demo-state
```

After reset, Alpha Bank's contribution package is prepared but not yet submitted, benchmark release is not ready, and audit record finalization is not shown.

---

## Product Workflow

Compass is repo-native, treasury-aware, and deterministic first. It is not a retail analytics app and it is not positioned as autonomous AI.

The product flow is organized around role-specific screens:

### Institution Desk

- **Overview**: Shows package readiness and benchmark state.
- **Contribute Data**: Reviews the prepared contribution package and assurance class.
- **Submit Package**: Confirms submission into the simulated confidential processing flow.
- **Confidential Processing**: Shows simulated TEE status, benchmark readiness, retention boundary, and attestation state.
- **Benchmark & Insights**: Shows derived cohort benchmark metrics.
- **My Position**: Shows Alpha Bank's institution-scoped derived output.
- **Record to Canton**: Finalizes a Canton-style audit reference for the released derived output.

### Operator

- **Operations Overview**: Monitors submissions, processing health, release readiness, and output availability.
- **Contribution Review**: Reviews submitted packages and resolves pending submissions.
- **Processing Control**: Triggers benchmark processing after review gates pass.
- **Benchmark Operations**: Reviews construction quality and release readiness.
- **Institution Output Review**: Reviews operator-safe output state; no Record-to-Canton action is exposed.

### Auditor

- **Audit Overview**: Reviews released/finalized state and high-level evidence status.
- **Policy Evidence**: Reviews contribution policy evidence and attestation rules.
- **Benchmark Audit**: Reviews benchmark release audit, construction quality, and processing evidence subsection.
- **Output Audit**: Reviews institution-scoped output audit state and release-approved package metadata.
- **Audit Record**: Reviews finalized Canton-style audit record references and audit trail events.

---

## Real-World Data Flow

In a production deployment, banks would not manually type full raw repo or treasury positions into Compass. Raw data would remain in bank systems such as treasury, collateral management, risk, or internal data warehouses.

A bank-side connector would extract only the selected benchmark fields required by an active campaign. Exact values would be transformed before leaving the institution-side environment:

| Raw institutional input | Privacy-safe benchmark contribution |
|---|---|
| Exact repo notional | Bucketed notional range |
| Exact secured funding rate | Normalized funding value |
| Detailed collateral positions | Collateral concentration summary |
| Exact maturity profile | Maturity bucket |
| Liquidity inputs | Policy-normalized benchmark field |

The result is a **contribution package**, not a raw position dump. The package may be self-reported, system-signed, or policy-recognized externally attested.

In production, this package would be sent into a confidential compute or TEE boundary for deterministic benchmark computation. The boundary would perform policy validation, field eligibility checks, trust weighting, cohort aggregation, outlier handling, benchmark score calculation, reliability scoring, and institution-scoped comparison.

Only derived outputs are released:

- Benchmark reliability package
- Cohort-level benchmark metrics
- Dispersion indicators
- Attested coverage
- Institution-scoped comparison outputs
- Attestation references
- Audit record references

---

## MVP Simulation Note

The current hackathon MVP uses seed-backed prepared contribution packages. The Institution Desk reviews privacy-safe package fields, confirms the contribution assurance class, and submits the package for simulated confidential processing.

The TEE/confidential processing boundary is simulated through backend lifecycle projections and UI state:

```text
Prepared contribution package
  -> Simulated TEE / confidential boundary
  -> Policy checks + deterministic benchmark computation
  -> Derived benchmark intelligence
  -> Institution-scoped output
  -> Canton-style audit reference
```

Canton recording is represented by a Canton-style reference such as `CANTON-REC-0001` or `CANTON-REC-0002`. Live Daml command submission, Canton event ingestion, and production TEE integration are future integration seams.

---

## Canton / Daml Role

The `canton/` package contains a workflow-oriented Daml skeleton for Compass, covering:

- Campaign lifecycle
- Contribution submission
- Submission review
- Processing runs
- Benchmark release
- Institution-scoped outputs
- Attestation references
- Audit records

Analytics remain off-ledger. Daml/Canton is used for workflow authority, role-based disclosure, lifecycle state, release control, attestation references, and audit-worthy records. Heavy computation, benchmark scoring, reliability scoring, and projection generation are handled by the FastAPI backend.

The current Daml layer is implementation-ready scaffolding. Backend bridge seams are intentionally left as TODOs for Canton event ingestion, Daml command submission, projection synchronization, and record finalization handshakes.

---

## Raw Data Safety

Final Auditor projections are sanitized:

- No raw Alpha Bank contribution values
- No raw peer positions
- No named peer breakdowns
- No payload dumps
- Auditor screens expose audit metadata, release scope, references, lifecycle state, and derived output summaries only
- Release scope is **derived outputs only**

Operators do not receive raw peer breakdowns. Institution Desk sees only its own prepared contribution package and its own institution-scoped derived output.

---

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

### Key Folders

- `frontend/` -> Vite frontend with role-aware Compass UI
- `services/crti-api/` -> FastAPI backend with projections, role-specific services, lifecycle guards, and seed-backed MVP state
- `services/crti-api/app/ledger.py` -> Canton/Daml adapter seams
- `services/crti-api/alembic/` -> persistence migration scaffold
- `canton/` -> Daml workflow skeleton for campaign, contribution, processing, release, institution output, and audit lifecycle
- `quickstart/` -> Canton runtime / integration area for future network attachment

See `docs/PROJECT_LAYOUT.md` for a folder-by-folder breakdown.

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
- `GET /api/auditor/campaigns/:campaignId/policy`
- `GET /api/auditor/processing/:runId/evidence`
- `GET /api/auditor/benchmark/:snapshotId/audit`
- `GET /api/auditor/institution-output/:outputId`
- `GET /api/auditor/audit-records/:recordId`

### Development

- `POST /api/dev/reset-demo-state`

---

## Verification

Latest validated checks:

```bash
npm run build
python -m pytest tests/test_smoke_flows.py
```

Also validated:

- Custom reset-to-finalized lifecycle script passed
- Static check for hash-only anchors passed
- Auditor mutation endpoint usage absent
- Auditor raw data projection safety checked
- `datetime.utcnow()` deprecation warnings removed from backend tests

Backend smoke tests cover:

- Institution Desk read, submit, processing, benchmark, position, and record flow
- Operator overview, pending submission review, processing trigger, release approval, and institution output review
- Auditor overview, policy evidence, benchmark audit, output audit, and audit record detail

---

## Roadmap / Next Steps

- Move from seed-backed state to persistent database storage
- Complete PostgreSQL-backed repository implementation
- Add live bank-side connector design and sample adapter
- Add backend-to-Daml command submission
- Add Canton event ingestion and projection synchronization
- Attach a live Canton runtime under `quickstart/`
- Add production-grade confidential compute / TEE integration
- Add external real data integrations
- Add exportable audit/evidence packages
