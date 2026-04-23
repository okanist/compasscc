from datetime import datetime

from .audit_package import AuditPackageService
from .computation import AlertsService, BenchmarkComputationService, InterpretationService, ReliabilityScoringService
from ..repository import CompassRepository
from ..schemas import CommandResult, ContributionSubmitRequest, ReviewSubmissionRequest


class ProcessingFlowService:
    """Async processing boundary for Compass workflow transitions.

    The methods are synchronous scaffolds today. They mark the service seams
    where background workers, queues, Canton event ingestion, and Daml commands
    will be connected.
    """

    def __init__(self, repo: CompassRepository) -> None:
        self.repo = repo
        self.benchmark = BenchmarkComputationService(ReliabilityScoringService(), AlertsService())
        self.interpretation = InterpretationService()
        self.audit_packages = AuditPackageService()

    def submit_contribution(self, campaign_id: int, institution_id: int, request: ContributionSubmitRequest) -> CommandResult:
        submission = self.repo.create_submission(campaign_id, institution_id, request.model_dump())
        run = self.repo.get_latest_run_for_campaign(campaign_id)
        # TODO: submit or correlate Daml Contribution contract command.
        return CommandResult(
            status="accepted",
            message="Contribution submitted for review.",
            resource_id=submission.id,
            next_state=submission.review_status,
            related_resource_id=run.id,
        )

    def review_submission(self, submission_id: int, request: ReviewSubmissionRequest) -> CommandResult:
        submission = self.repo.update_submission_review(submission_id, request.review_status, request.policy_status)
        # TODO: emit validation result to Canton workflow state.
        return CommandResult(status="ok", message="Submission review state updated.", resource_id=submission.id, next_state=submission.review_status)

    def trigger_processing_run(self, campaign_id: int) -> CommandResult:
        submissions = self.repo.list_submissions(campaign_id=campaign_id)
        valid = [item for item in submissions if item.review_status == "approved"]
        run = self.repo.create_processing_run(campaign_id=campaign_id, status="release_pending")
        snapshot = self.benchmark.compute_snapshot(
            snapshot_id=max(self.repo.snapshots) + 1,
            processing_run_id=run.id,
            campaign_id=campaign_id,
            scenario=self.repo.get_campaign(campaign_id).scenario,
            submissions=valid,
            created_at=datetime.utcnow(),
        )
        self.repo.snapshots[snapshot.id] = snapshot
        for output_id, output in list(self.repo.outputs.items()):
            if output.benchmark_snapshot_id == 1:
                self.repo.outputs[output_id] = output.model_copy(
                    update={
                        "processing_run_id": run.id,
                        "benchmark_snapshot_id": snapshot.id,
                        "network_average": snapshot.average_liquidity,
                        "release_status": "release_pending",
                    }
                )
        # TODO: dispatch background job and persist run lifecycle transitions.
        return CommandResult(
            status="queued",
            message="Processing run boundary accepted.",
            resource_id=run.id,
            next_state=run.run_status,
            related_resource_id=snapshot.id,
        )

    def approve_release(self, run_id: int) -> CommandResult:
        run = self.repo.update_run_status(run_id, "released", release_status="approved")
        self.repo.update_outputs_release_status_for_run(run_id, "approved")
        # TODO: issue Daml command to transition release approval state.
        return CommandResult(status="ok", message="Release approval scaffold updated.", resource_id=run.id, next_state="approved")

    def record_to_canton(self, output_id: int) -> CommandResult:
        record = self.repo.get_audit_record_for_output(output_id)
        if record is None:
            record = self.repo.get_audit_record(1)
        updated = self.repo.update_audit_record_status(record.id, "finalized", canton_ref=f"CANTON-REC-{output_id:04d}")
        # TODO: replace draft ref with Canton command result and final ledger event.
        return CommandResult(status="finalized", message="Record-to-Canton handoff finalized.", resource_id=updated.id, next_state=updated.record_status)
