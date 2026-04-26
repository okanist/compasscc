from datetime import datetime

from ..api.errors import duplicate_action, invalid_transition, not_found
from ..ledger import LedgerCommandAdapter
from ..lifecycle import (
    RECORD_FINALIZED,
    RELEASE_APPROVED,
    RELEASE_DRAFT,
    RELEASE_PUBLISHED,
    RUN_COMPLETED,
    RUN_FAILED,
    RUN_RELEASE_PENDING,
    RUN_RELEASED,
    SUBMISSION_APPROVED,
    SUBMISSION_BENCHMARK_VALID_STATES,
    SUBMISSION_REJECTED,
    SUBMISSION_TERMINAL_STATES,
)
from .audit_package import AuditPackageService
from .computation import (
    AlertsService,
    BenchmarkComputationService,
    InstitutionComparisonService,
    InterpretationService,
    ReliabilityScoringService,
)
from ..repository import CompassRepository
from ..schemas import CommandResult, ContributionSubmitRequest, ReviewSubmissionRequest


class ProcessingFlowService:
    """Async processing boundary for Compass workflow transitions.

    The methods are synchronous scaffolds today. They mark the service seams
    where background workers, queues, Canton event ingestion, and Daml commands
    will be connected.
    """

    def __init__(self, repo: CompassRepository, ledger: LedgerCommandAdapter) -> None:
        self.repo = repo
        self.ledger = ledger
        self.benchmark = BenchmarkComputationService(ReliabilityScoringService(), AlertsService())
        self.comparison = InstitutionComparisonService()
        self.interpretation = InterpretationService()
        self.audit_packages = AuditPackageService()

    def submit_contribution(self, campaign_id: int, institution_id: int, request: ContributionSubmitRequest) -> CommandResult:
        if campaign_id not in self.repo.campaigns:
            raise not_found("campaign", campaign_id)
        if institution_id not in self.repo.institutions:
            raise not_found("institution", institution_id)
        submission, created = self.repo.create_or_update_submission(campaign_id, institution_id, request.model_dump())
        run = self.repo.get_latest_run_for_campaign(campaign_id)
        self.ledger.submit_contribution(submission.id)
        return CommandResult(
            status="accepted",
            message="Contribution submitted for review." if created else "Existing open contribution updated for review.",
            resource_id=submission.id,
            next_state=submission.review_status,
            related_resource_id=run.id,
        )

    def review_submission(self, submission_id: int, request: ReviewSubmissionRequest) -> CommandResult:
        if submission_id not in self.repo.submissions:
            raise not_found("submission", submission_id)
        current = self.repo.get_submission(submission_id)
        if current.review_status in SUBMISSION_TERMINAL_STATES:
            if current.review_status == request.review_status:
                return CommandResult(
                    status="ok",
                    message="Submission is already in the requested terminal state.",
                    resource_id=current.id,
                    next_state=current.review_status,
                )
            raise invalid_transition(
                "Approved or rejected submissions cannot be reviewed again.",
                resource_id=current.id,
                current_state=current.review_status,
            )
        submission = self.repo.update_submission_review(submission_id, request.review_status, request.policy_status)
        self.ledger.review_submission(submission.id, submission.review_status)
        return CommandResult(status="ok", message="Submission review state updated.", resource_id=submission.id, next_state=submission.review_status)

    def trigger_processing_run(self, campaign_id: int) -> CommandResult:
        if campaign_id not in self.repo.campaigns:
            raise not_found("campaign", campaign_id)
        active_run = self.repo.get_active_run_for_campaign(campaign_id)
        if active_run:
            raise invalid_transition(
                "A processing run is already queued or running for this campaign.",
                resource_id=active_run.id,
                current_state=active_run.run_status,
            )
        submissions = self.repo.list_submissions(campaign_id=campaign_id)
        valid = [item for item in submissions if item.review_status in SUBMISSION_BENCHMARK_VALID_STATES]
        blocked = [item for item in submissions if item.review_status in {SUBMISSION_REJECTED, "needs_attestation"}]
        if not valid:
            latest = self.repo.get_latest_run_for_campaign(campaign_id)
            if latest.run_status == RUN_FAILED:
                return CommandResult(
                    status="retry_ready",
                    message="Previous run failed and no valid submissions are available for retry.",
                    resource_id=latest.id,
                    next_state=RUN_FAILED,
                )
            raise invalid_transition("Cannot trigger processing without approved submissions.", current_state=RELEASE_DRAFT)
        run = self.repo.create_processing_run(campaign_id=campaign_id, status=RUN_COMPLETED)
        self.ledger.create_processing_run(run.id)
        snapshot = self.benchmark.compute_snapshot(
            snapshot_id=max(self.repo.snapshots) + 1,
            processing_run_id=run.id,
            campaign_id=campaign_id,
            scenario=self.repo.get_campaign(campaign_id).scenario,
            submissions=valid,
            created_at=datetime.utcnow(),
        )
        self.repo.snapshots[snapshot.id] = snapshot
        for submission in valid:
            comparison = self.comparison.compare(
                liquidity_score=float(submission.payload_json.get("liquidity_score", 0)),
                benchmark_average=snapshot.average_liquidity,
                reliability_score=snapshot.reliability_score,
            )
            output = self.repo.create_or_update_output_for_submission(
                processing_run_id=run.id,
                snapshot=snapshot,
                submission=submission,
                comparison=comparison,
                interpretation=self.interpretation.institution_summary(
                    delta_vs_benchmark=float(comparison["delta_vs_benchmark"]),
                    risk_tier=str(comparison["risk_tier"]),
                    collateral_structure=str(submission.payload_json.get("collateral_structure", "Not provided")),
                ),
            )
            self.ledger.create_institution_output(output.id)
        run = self.repo.update_run_status(run.id, RUN_RELEASE_PENDING, release_status=RUN_RELEASE_PENDING)
        self.ledger.mark_run_completed(run.id)
        return CommandResult(
            status="queued",
            message=f"Processing run completed with {len(valid)} valid inputs and {len(blocked)} blocked inputs.",
            resource_id=run.id,
            next_state=run.run_status,
            related_resource_id=snapshot.id,
        )

    def approve_release(self, run_id: int) -> CommandResult:
        if run_id not in self.repo.runs:
            raise not_found("run", run_id)
        current = self.repo.get_run(run_id)
        release_status = str(current.notes_json.get("release_status", RELEASE_DRAFT))
        if release_status == RELEASE_PUBLISHED:
            raise duplicate_action("Published releases cannot be approved again.", resource_id=run_id, current_state=RELEASE_PUBLISHED)
        if current.run_status == RUN_RELEASED or release_status == RELEASE_APPROVED:
            return CommandResult(status="ok", message="Release is already approved.", resource_id=current.id, next_state=RELEASE_APPROVED)
        if current.run_status not in {RUN_COMPLETED, RUN_RELEASE_PENDING}:
            raise invalid_transition(
                "Cannot approve release before processing run is completed.",
                resource_id=current.id,
                current_state=current.run_status,
            )
        run = self.repo.update_run_status(run_id, RUN_RELEASED, release_status=RELEASE_APPROVED)
        self.repo.update_outputs_release_status_for_run(run_id, RELEASE_APPROVED)
        self.ledger.approve_release(run.id)
        return CommandResult(status="ok", message="Release approved and institution outputs are release-ready.", resource_id=run.id, next_state=RELEASE_APPROVED)

    def record_to_canton(self, output_id: int) -> CommandResult:
        if output_id not in self.repo.outputs:
            raise not_found("output", output_id)
        output = self.repo.get_output(output_id)
        if output.release_status not in {RELEASE_APPROVED, RELEASE_PUBLISHED}:
            raise invalid_transition(
                "Institution output can only be recorded after release approval or publication.",
                resource_id=output.id,
                current_state=output.release_status,
            )
        record = self.repo.create_or_get_audit_record_for_output(output_id)
        if record.record_status == RECORD_FINALIZED:
            return CommandResult(
                status="finalized",
                message="Audit record was already finalized.",
                resource_id=record.id,
                next_state=record.record_status,
            )
        ledger_ref = self.ledger.finalize_audit_record(record.id)
        updated = self.repo.update_audit_record_status(record.id, RECORD_FINALIZED, canton_ref=ledger_ref.ref)
        return CommandResult(status="finalized", message="Record-to-Canton handoff finalized.", resource_id=updated.id, next_state=updated.record_status)
