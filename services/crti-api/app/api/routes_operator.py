from fastapi import APIRouter, Depends, Query

from .deps import get_operator_service, get_processing_flow, get_repository
from ..repository import CompassRepository
from ..schemas import CommandResult, ReviewSubmissionRequest
from ..services.processing_flow import ProcessingFlowService
from ..services.view_services import OperatorViewService

router = APIRouter(prefix="/api/operator", tags=["operator"])


@router.get("/overview")
def get_overview(service: OperatorViewService = Depends(get_operator_service)):
    return service.get_overview()


@router.get("/campaigns/{campaign_id}")
def get_campaign(campaign_id: int, service: OperatorViewService = Depends(get_operator_service)):
    return service.get_campaign_view(campaign_id)


@router.get("/submissions/pending")
def get_pending_submissions(repo: CompassRepository = Depends(get_repository)):
    return repo.list_submissions(review_status="pending")


@router.post("/submissions/{submission_id}/review", response_model=CommandResult)
def review_submission(
    submission_id: int,
    request: ReviewSubmissionRequest,
    flow: ProcessingFlowService = Depends(get_processing_flow),
):
    return flow.review_submission(submission_id, request)


@router.get("/processing/{run_id}")
def get_processing(run_id: int, service: OperatorViewService = Depends(get_operator_service)):
    return service.get_processing_view(run_id)


@router.post("/processing/{campaign_id}/trigger", response_model=CommandResult)
def trigger_processing(campaign_id: int, flow: ProcessingFlowService = Depends(get_processing_flow)):
    return flow.trigger_processing_run(campaign_id)


@router.post("/releases/{run_id}/approve", response_model=CommandResult)
def approve_release(run_id: int, flow: ProcessingFlowService = Depends(get_processing_flow)):
    return flow.approve_release(run_id)


@router.get("/benchmark")
def get_benchmark(
    scenario: str | None = Query(default=None),
    service: OperatorViewService = Depends(get_operator_service),
):
    return service.get_benchmark_view(scenario)
