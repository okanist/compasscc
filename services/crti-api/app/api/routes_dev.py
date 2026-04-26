from fastapi import APIRouter, Depends

from .deps import get_repository
from ..repository import CompassRepository
from ..schemas import CommandResult

router = APIRouter(prefix="/api/dev", tags=["dev"])


@router.post("/reset-demo-state", response_model=CommandResult)
def reset_demo_state(repo: CompassRepository = Depends(get_repository)):
    repo.reset()
    return CommandResult(status="ok", message="Seed-backed demo state reset.", resource_id=None, next_state="seeded")
