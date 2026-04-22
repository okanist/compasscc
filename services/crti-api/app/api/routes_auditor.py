from fastapi import APIRouter, Depends

from .deps import get_auditor_service
from ..services.view_services import AuditorViewService

router = APIRouter(prefix="/api/auditor", tags=["auditor"])


@router.get("/overview")
def get_overview(service: AuditorViewService = Depends(get_auditor_service)):
    return service.get_overview()


@router.get("/campaigns/{campaign_id}/policy")
def get_policy_review(campaign_id: int, service: AuditorViewService = Depends(get_auditor_service)):
    return service.get_policy_review(campaign_id)


@router.get("/processing/{run_id}/evidence")
def get_processing_evidence(run_id: int, service: AuditorViewService = Depends(get_auditor_service)):
    return service.get_processing_evidence(run_id)


@router.get("/benchmark/{snapshot_id}/audit")
def get_benchmark_audit(snapshot_id: int, service: AuditorViewService = Depends(get_auditor_service)):
    return service.get_benchmark_audit_view(snapshot_id)


@router.get("/institution-output/{output_id}")
def get_institution_output_audit(output_id: int, service: AuditorViewService = Depends(get_auditor_service)):
    return service.get_institution_output_audit(institution_id=1, output_id=output_id)


@router.get("/audit-records/{record_id}")
def get_audit_record(record_id: int, service: AuditorViewService = Depends(get_auditor_service)):
    return service.get_audit_record(record_id)
