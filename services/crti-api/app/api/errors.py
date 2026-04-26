from typing import Any

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class CompassApiError(HTTPException):
    def __init__(
        self,
        *,
        code: str,
        message: str,
        status_code: int = 400,
        resource_id: int | None = None,
        current_state: str | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.resource_id = resource_id
        self.current_state = current_state
        super().__init__(status_code=status_code, detail=message)

    def payload(self) -> dict[str, Any]:
        return {
            "status": "error",
            "error": {
                "code": self.code,
                "message": self.message,
                "resource_id": self.resource_id,
                "current_state": self.current_state,
            },
        }


async def compass_api_error_handler(_request: Request, exc: CompassApiError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=exc.payload())


async def key_error_handler(_request: Request, exc: KeyError) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={
            "status": "error",
            "error": {
                "code": "resource_not_found",
                "message": "Requested Compass resource was not found.",
                "resource_id": exc.args[0] if exc.args else None,
                "current_state": None,
            },
        },
    )


def not_found(resource: str, resource_id: int | None = None) -> CompassApiError:
    return CompassApiError(
        code=f"{resource}_not_found",
        message=f"{resource.replace('_', ' ').title()} was not found.",
        status_code=404,
        resource_id=resource_id,
    )


def invalid_transition(message: str, resource_id: int | None = None, current_state: str | None = None) -> CompassApiError:
    return CompassApiError(
        code="invalid_state_transition",
        message=message,
        status_code=409,
        resource_id=resource_id,
        current_state=current_state,
    )


def duplicate_action(message: str, resource_id: int | None = None, current_state: str | None = None) -> CompassApiError:
    return CompassApiError(
        code="duplicate_action",
        message=message,
        status_code=409,
        resource_id=resource_id,
        current_state=current_state,
    )
