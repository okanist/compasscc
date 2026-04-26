# Compass Projection API

This service provides the backend projection and role-specific view-service scaffold for Compass.

Compass keeps responsibilities separated:

- Canton/Daml: authoritative workflow and disclosure state
- Backend services: computed analytics, projection storage, and read-optimized views
- Frontend: role-aware presentation

## Endpoints

Legacy frontend-compatible endpoints remain available:

- `GET /overview`
- `GET /campaigns`
- `GET /processing`
- `GET /benchmark`
- `GET /position`
- `GET /explainable-summary`

Role-specific endpoint scaffolds:

- `GET /api/desk/overview`
- `GET /api/desk/contribute/{campaign_id}`
- `POST /api/desk/contribute/{campaign_id}/submit`
- `GET /api/desk/processing/{run_id}`
- `GET /api/desk/benchmark?scenario=...`
- `GET /api/desk/my-position?scenario=...`
- `POST /api/desk/my-position/{output_id}/record`
- `GET /api/operator/overview`
- `GET /api/operator/campaigns/{campaign_id}`
- `GET /api/operator/submissions/pending`
- `POST /api/operator/submissions/{submission_id}/review`
- `GET /api/operator/processing/{run_id}`
- `POST /api/operator/processing/{campaign_id}/trigger`
- `POST /api/operator/releases/{run_id}/approve`
- `GET /api/operator/benchmark?scenario=...`
- `GET /api/auditor/overview`
- `GET /api/auditor/campaigns/{campaign_id}/policy`
- `GET /api/auditor/processing/{run_id}/evidence`
- `GET /api/auditor/benchmark/{snapshot_id}/audit`
- `GET /api/auditor/institution-output/{output_id}`
- `GET /api/auditor/audit-records/{record_id}`
- `POST /api/dev/reset-demo-state`

## Structure

- `app/domain/models.py`: SQLAlchemy entities for normalized storage
- `app/schemas.py`: DTOs and UI projection serializers
- `app/repository.py`: seed-backed repository boundary
- `app/sqlalchemy_repository.py`: PostgreSQL-ready repository scaffold
- `app/ledger.py`: Daml/Canton command and event adapter interfaces
- `app/lifecycle.py`: shared lifecycle states and transition groups
- `app/services/computation.py`: benchmark, reliability, comparison, interpretation, and alert services
- `app/services/projections.py`: read-optimized projection factories
- `app/services/view_services.py`: desk, operator, and auditor view services
- `app/services/processing_flow.py`: async workflow boundary scaffolding
- `app/api`: FastAPI routers

TODO markers identify the Canton event-ingestion, Daml command-integration, projection synchronization, and ledger checkpointing seams.

## State and integration readiness

The seed repository remains the default development/demo mode. Command handlers guard duplicate and invalid lifecycle transitions for submissions, processing runs, releases, and audit records. Duplicate Desk submissions update the open contribution; terminal submissions require a new explicit version. Record-to-Canton is idempotent and returns the existing finalized record on repeated clicks.

Persistence scaffolding is included through SQLAlchemy models, `SQLAlchemyCompassRepository`, Alembic setup, and `.env.example`:

```bash
cp .env.example .env
alembic upgrade head
```

Set `DATABASE_URL` to a PostgreSQL URL when replacing the seed-backed repository.

For repeatable demos:

```bash
curl -X POST http://localhost:8000/api/dev/reset-demo-state
```

Smoke tests cover the Desk, Operator, and Auditor demo paths:

```bash
pytest
```

## Run

### PowerShell

```powershell
./run-dev.ps1
```

### Bash

```bash
./run-dev.sh
```

### Manual

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The current repository is seed-backed by design. Replace `CompassRepository` with SQLAlchemy-backed repositories when persistence is introduced.

