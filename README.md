# Compass

Compass helps Canton institutions benchmark treasury and collateral performance privately, without exposing raw positions.

Compass is a privacy-preserving institutional intelligence product for repo and treasury activity on Canton. It enables institutions to benchmark liquidity, collateral structure, and market positioning without exposing raw proprietary data. Selected contribution fields are processed confidentially and turned into trust-weighted benchmark intelligence, institution-specific signals, and auditable outputs.

## Problem / Solution / Why Canton

| Category | Summary |
| --- | --- |
| Problem | Institutional crypto treasury and operations teams struggle to compare liquidity, collateral structure, and repo posture to peers because privacy-first workflows fragment market intelligence. |
| Solution | Compass collects selected contribution fields, processes them confidentially, and produces trust-weighted benchmark intelligence plus institution-scoped comparison outputs without exposing raw positions. |
| Why Canton | Canton is built for privacy-first institutional workflows, selective disclosure, and auditable business processes, which makes it the right foundation for contribution policies, benchmark lifecycle control, and recorded intelligence outputs. |

## Product Overview

Compass is not a broad retail analytics product and it is not positioned as autonomous AI. The product is repo-native, treasury-aware, and deterministic first.

The demo shows five steps:

1. Network Intelligence Overview: show that privacy-preserving contribution can still generate network-wide signals.
2. Contribution Campaign: define what institutions are asked to contribute and how contribution quality affects benchmark strength.
3. Confidential Processing: explain the trusted execution model and deterministic processing boundary.
4. Benchmark Intelligence: surface anonymized aggregate signals and benchmark reliability.
5. My Position Intelligence: compare one institution to the benchmark and produce an auditable, local explainable summary.

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

See [PROJECT_LAYOUT.md](/d:/Code/compasscc/docs/PROJECT_LAYOUT.md) for a quick folder-by-folder breakdown.

## Quick Demo Instructions

1. Start the mock API.
2. Start the frontend.
3. Open the Compass console in the browser.
4. Walk through the five demo screens in order.
5. Use the role switcher in the header to show how the UI is structured for future role-based visibility.

## Frontend Instructions

From [frontend/](/d:/Code/compasscc/frontend):

```bash
npm install
npm run dev
```

The Vite app expects the mock API at `http://localhost:8000` by default. If the API is unavailable, the UI falls back to local demo data so the mockup remains demo-ready.

## Mock API Instructions

From [services/crti-api/](/d:/Code/compasscc/services/crti-api):

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows PowerShell
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Helper scripts are included:

- Windows: [run-dev.ps1](/d:/Code/compasscc/services/crti-api/run-dev.ps1)
- Unix-like: [run-dev.sh](/d:/Code/compasscc/services/crti-api/run-dev.sh)

## DAML / Canton Package Notes

The package in [canton/](/d:/Code/compasscc/canton) is a clean architectural skeleton for the Compass workflow. It is intentionally lightweight and focuses on:

- tokenized repo and treasury-aware assets
- benchmark contribution contracts
- benchmark publication and visibility
- institution-scoped intelligence requests and results
- auditable Canton recording points

The package is not a full production integration. It is a judge-friendly expression of the intended Canton workflow and data lifecycle.

## Roadmap / Next Steps

- Connect the frontend to a real confidential compute service instead of static mock responses.
- Extend DAML choices for contribution attestation, operator workflow, and regulator audit access.
- Add scenario-specific benchmark histories and drill-down views.
- Attach a real Canton runtime and upstream quickstart stack under `quickstart/` when the integration environment is available.

