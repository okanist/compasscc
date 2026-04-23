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
    submissions = repo.list_pending_operator_submissions()
    return [
        {
            "id": item.id,
            "campaign_id": item.campaign_id,
            "institution_id": item.institution_id,
            "institution": repo.get_institution(item.institution_id).name,
            "submission_type": item.submission_type,
            "policy_status": item.policy_status,
            "review_status": item.review_status,
            "attestation_status": item.attestation_status,
            "confidence_tier": item.confidence_tier,
            "submitted_at": item.submitted_at,
            "updated_at": item.updated_at,
        }
        for item in submissions
    ]


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


@router.get("/institution-output/{institution_id}")
def get_institution_output(
    institution_id: int,
    snapshot_id: int | None = Query(default=None),
    repo: CompassRepository = Depends(get_repository),
    service: OperatorViewService = Depends(get_operator_service),
):
    active_snapshot_id = snapshot_id or max(repo.snapshots)
    return service.get_institution_output_review(institution_id, active_snapshot_id)


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
