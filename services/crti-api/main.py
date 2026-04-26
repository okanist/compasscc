from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_auditor import router as auditor_router
from app.api.routes_desk import router as desk_router
from app.api.routes_dev import router as dev_router
from app.api.errors import CompassApiError, compass_api_error_handler, key_error_handler
from app.api.routes_legacy import router as legacy_router
from app.api.routes_operator import router as operator_router

app = FastAPI(
    title="Compass Projection API",
    description=(
        "Role-specific read services and computed projection scaffolding for Compass. "
        "Canton/Daml remains the authoritative workflow and disclosure state boundary."
    ),
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(CompassApiError, compass_api_error_handler)
app.add_exception_handler(KeyError, key_error_handler)

app.include_router(legacy_router)
app.include_router(desk_router)
app.include_router(operator_router)
app.include_router(auditor_router)
app.include_router(dev_router)
