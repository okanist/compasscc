# CRTI Mock API

This service provides hackathon-ready JSON endpoints for the Compass frontend demo.

## Endpoints

- `GET /overview`
- `GET /campaigns`
- `GET /processing`
- `GET /benchmark`
- `GET /position`
- `GET /explainable-summary`

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

The service is mocked by design. It exists to support the frontend and demo narrative rather than live Canton integration.

