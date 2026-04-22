from .audit_package import AuditPackageService
from .projections import ProjectionFactory, pct
from ..repository import CompassRepository
from ..schemas import ActionDTO, MetricDTO


class BaseViewService:
    def __init__(self, repo: CompassRepository) -> None:
        self.repo = repo
        self.projections = ProjectionFactory(repo, AuditPackageService())


class DeskViewService(BaseViewService):
    def get_overview(self, institution_id: int = 1):
        snapshot = self.repo.get_snapshot()
        output = self.repo.get_output_for_institution(institution_id, snapshot.id)
        return self.projections.overview_projection(
            "institution_desk",
            [
                MetricDTO(label="Own Contribution Status", value="Submitted", detail="Awaiting operator validation"),
                MetricDTO(label="Own Benchmark Teaser", value=f"{output.delta_vs_benchmark:+.1f} pts", detail="Delta vs active benchmark"),
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%"),
                MetricDTO(label="Network Benchmark Context", value=f"{snapshot.contributor_count} contributors"),
            ],
            [
                "Contribution status, benchmark context, and next actions for the institution desk.",
                output.suggested_interpretation,
            ],
            [
                ActionDTO(title="Submit Contribution", body="Submit or revise the active campaign package."),
                ActionDTO(title="Compare to My Position", body="Open institution-scoped benchmark interpretation."),
            ],
        )

    def get_contribute_view(self, institution_id: int, campaign_id: int):
        return self.projections.campaign_projection(
            campaign_id,
            [ActionDTO(title="Submit Contribution", body="Submit selected fields under campaign policy.")],
        )

    def get_processing_view(self, institution_id: int, run_id: int):
        return self.projections.processing_projection(
            run_id,
            [ActionDTO(title="View Attestation Record", body="Open the runtime reference for this processing run.")],
        )

    def get_benchmark_view(self, institution_id: int, scenario: str | None):
        return self.projections.benchmark_projection(
            scenario,
            [ActionDTO(title="Compare to My Position", body="Open institution-scoped comparison output.")],
        )

    def get_my_position(self, institution_id: int, scenario: str | None):
        return self.projections.institution_output_projection(
            institution_id,
            scenario,
            [ActionDTO(title="Record to Canton", body="Prepare the institution-scoped output record.")],
        )


class OperatorViewService(BaseViewService):
    def get_overview(self):
        snapshot = self.repo.get_snapshot()
        pending = self.repo.list_submissions(review_status="pending")
        return self.projections.overview_projection(
            "operator",
            [
                MetricDTO(label="Active Campaigns", value=str(len(self.repo.campaigns))),
                MetricDTO(label="Contributor Depth", value=str(snapshot.contributor_count)),
                MetricDTO(label="Attested Coverage", value=pct(snapshot.attested_coverage)),
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%"),
                MetricDTO(label="Pending Validations", value=str(len(pending))),
                MetricDTO(label="Processing Health", value="Nominal"),
            ],
            ["Operational view across campaign participation, validation state, and processing health."],
            [
                ActionDTO(title="Trigger Benchmark Run", body="Start deterministic benchmark computation."),
                ActionDTO(title="Review Submission", body="Open pending contribution validation queue."),
            ],
        )

    def get_campaign_view(self, campaign_id: int):
        return self.projections.campaign_projection(
            campaign_id,
            [
                ActionDTO(title="Review Submission", body="Review pending submissions."),
                ActionDTO(title="Approve Release", body="Approve validated contribution batches."),
            ],
        )

    def get_processing_view(self, run_id: int):
        return self.projections.processing_projection(
            run_id,
            [
                ActionDTO(title="Trigger Benchmark Run", body="Start or rerun benchmark computation."),
                ActionDTO(title="Approve Release", body="Approve ready output packages."),
            ],
        )

    def get_benchmark_view(self, scenario: str | None):
        return self.projections.benchmark_projection(
            scenario,
            [
                ActionDTO(title="Trigger Benchmark Run", body="Recompute scenario-wide metrics."),
                ActionDTO(title="Approve Release", body="Promote the release candidate."),
            ],
        )

    def get_institution_output_review(self, institution_id: int, snapshot_id: int):
        snapshot = self.repo.get_snapshot(snapshot_id)
        return self.projections.institution_output_projection(
            institution_id,
            snapshot.scenario,
            [
                ActionDTO(title="Approve Release", body="Approve this institution output package."),
                ActionDTO(title="Review Submission", body="Open validation history for the institution."),
            ],
        )


class AuditorViewService(BaseViewService):
    def get_overview(self):
        snapshot = self.repo.get_snapshot()
        return self.projections.overview_projection(
            "auditor",
            [
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%"),
                MetricDTO(label="Attestation Coverage", value=pct(snapshot.attested_coverage)),
                MetricDTO(label="Release Scope", value="Derived outputs only"),
                MetricDTO(label="Retention Compliance", value="Enforced"),
                MetricDTO(label="Audit Trail Status", value="Current"),
            ],
            ["Audit-oriented summary of reliability, attestation coverage, release scope, and retention controls."],
            [
                ActionDTO(title="View Audit Package", body="Open benchmark and output evidence package."),
                ActionDTO(title="View Audit Trail", body="Review release and evidence events."),
            ],
        )

    def get_policy_review(self, campaign_id: int):
        return self.projections.campaign_projection(
            campaign_id,
            [
                ActionDTO(title="Open Evidence Package", body="Inspect policy controls and accepted submission classes."),
                ActionDTO(title="View Audit Trail", body="Review contribution policy events."),
            ],
        )

    def get_processing_evidence(self, run_id: int):
        return self.projections.processing_projection(
            run_id,
            [
                ActionDTO(title="Open Evidence Package", body="Inspect attestation and retention evidence."),
                ActionDTO(title="View Audit Trail", body="Open run lifecycle events."),
            ],
        )

    def get_benchmark_audit_view(self, snapshot_id: int):
        snapshot = self.repo.get_snapshot(snapshot_id)
        return self.projections.benchmark_projection(
            snapshot.scenario,
            [
                ActionDTO(title="View Audit Package", body="Inspect methodology and released output scope."),
                ActionDTO(title="View Audit Trail", body="Review benchmark release events."),
            ],
        )

    def get_institution_output_audit(self, institution_id: int, output_id: int):
        output = self.repo.get_output(output_id)
        snapshot = self.repo.get_snapshot(output.benchmark_snapshot_id)
        return self.projections.institution_output_projection(
            institution_id,
            snapshot.scenario,
            [
                ActionDTO(title="Open Evidence Package", body="Inspect attestation-linked output."),
                ActionDTO(title="View Audit Trail", body="Open event history for this output."),
            ],
        )

    def get_audit_record(self, record_id: int):
        return self.projections.audit_projection(
            record_id,
            [
                ActionDTO(title="Open Evidence Package", body="Inspect release scope and attestation evidence."),
                ActionDTO(title="View Audit Trail", body="Review Canton recording lifecycle."),
            ],
        )
