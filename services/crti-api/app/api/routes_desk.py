from fastapi import APIRouter, Depends, Query

from .deps import get_desk_service, get_processing_flow
from ..schemas import CommandResult, ContributionSubmitRequest
from ..services.processing_flow import ProcessingFlowService
from ..services.view_services import DeskViewService

router = APIRouter(prefix="/api/desk", tags=["desk"])


@router.get("/overview")
def get_overview(service: DeskViewService = Depends(get_desk_service)):
    return service.get_overview(institution_id=1)


@router.get("/contribute/{campaign_id}")
def get_contribute_view(campaign_id: int, service: DeskViewService = Depends(get_desk_service)):
    return service.get_contribute_view(institution_id=1, campaign_id=campaign_id)


@router.post("/contribute/{campaign_id}/submit", response_model=CommandResult)
def submit_contribution(
    campaign_id: int,
    request: ContributionSubmitRequest,
    flow: ProcessingFlowService = Depends(get_processing_flow),
):
    return flow.submit_contribution(campaign_id=campaign_id, institution_id=1, request=request)


@router.get("/processing/{run_id}")
def get_processing_view(run_id: int, service: DeskViewService = Depends(get_desk_service)):
    return service.get_processing_view(institution_id=1, run_id=run_id)


@router.get("/benchmark")
def get_benchmark_view(
    scenario: str | None = Query(default=None),
    service: DeskViewService = Depends(get_desk_service),
):
    return service.get_benchmark_view(institution_id=1, scenario=scenario)


@router.get("/my-position")
def get_my_position(
    scenario: str | None = Query(default=None),
    service: DeskViewService = Depends(get_desk_service),
):
    return service.get_my_position(institution_id=1, scenario=scenario)


@router.post("/my-position/{output_id}/record", response_model=CommandResult)
def record_position(output_id: int, flow: ProcessingFlowService = Depends(get_processing_flow)):
    return flow.record_to_canton(output_id)
