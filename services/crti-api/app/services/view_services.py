from .audit_package import AuditPackageService
from .projections import ProjectionFactory, pct
from ..repository import CompassRepository
from ..schemas import ActionDTO, MetricDTO


class BaseViewService:
    def __init__(self, repo: CompassRepository) -> None:
        self.repo = repo
        self.projections = ProjectionFactory(repo, AuditPackageService())


class DeskViewService(BaseViewService):
    def _desk_contribution_package(self, institution_id: int, campaign_id: int) -> tuple[dict, dict]:
        campaign = self.repo.get_campaign(campaign_id)
        submission = self.repo.get_latest_submission_for_institution(campaign_id, institution_id)
        payload = submission.payload_json if submission else {
            "liquidity_score": 69.1,
            "repo_rate": 4.92,
            "haircut": 3.1,
            "notional": 142_000_000,
            "collateral_structure": "UST-heavy with concentrated tenor",
            "maturity_bucket": "8-14 days",
        }
        status = submission.review_status.replace("_", " ").title() if submission else "Ready"
        selected_type = submission.submission_type if submission else "System-signed"
        attestation_status = submission.attestation_status.replace("_", " ").title() if submission else "System Signed"
        field_map = {
            "repo notional range": f"${int(payload.get('notional', 0)) // 1_000_000 - 25}M-${int(payload.get('notional', 0)) // 1_000_000 + 25}M bucket",
            "secured funding rate": f"{float(payload.get('repo_rate', 0)):.2f}% normalized",
            "collateral concentration": str(payload.get("collateral_structure", "Policy bucket unavailable")),
            "average maturity bucket": str(payload.get("maturity_bucket", "Policy bucket unavailable")),
            "liquidity buffer ratio": "Policy-normalized score input",
        }
        package = {
            "status": status,
            "selected_type": selected_type,
            "confidence_tier": submission.confidence_tier if submission else campaign.confidence_tier_required,
            "attestation_status": attestation_status,
            "raw_data_retention": "Raw package values are not displayed or retained outside the confidential processing boundary.",
            "confidential_processing": "Enabled" if campaign.tee_processing_enabled else "Disabled",
            "preview_fields": [
                {
                    "field": field,
                    "status": "Submitted" if submission else "Ready",
                    "preview_value": field_map.get(field, "Prepared policy field"),
                    "transformation": "Masked / bucketed / normalized",
                    "eligible_for_scoring": True,
                }
                for field in campaign.requested_fields_json
            ],
        }
        policy = {
            "contribution_reward": "Benchmark access after contribution acceptance",
            "contribution_types": [
                {
                    "type": "Self-reported",
                    "benchmark_weight": "Standard",
                    "trust_class": "Declared Institutional Input",
                    "policy_status": "Accepted for review with limited reliability weighting",
                    "explanation": "Supported as a demo assurance class. It carries lower benchmark weight until stronger verification is available.",
                    "attestation_status": "needs_attestation",
                },
                {
                    "type": "System-signed",
                    "benchmark_weight": "Elevated",
                    "trust_class": "System-Signed Package",
                    "policy_status": "Eligible for final benchmark scoring after review",
                    "explanation": "Uses the MVP's system-signed package path. This is the prepared Alpha Bank demo contribution type.",
                    "attestation_status": "system_signed",
                },
                {
                    "type": "Oracle / custodian-attested",
                    "benchmark_weight": "Highest",
                    "trust_class": "Externally Attested Package",
                    "policy_status": "Recognized by policy, not live-integrated in this MVP",
                    "explanation": "Shown as a supported policy class for future or pre-arranged attestations; the MVP does not connect to a live oracle or custodian service.",
                    "attestation_status": "attested",
                },
            ],
            "eligibility_rules": [
                {"label": "Selected fields match active campaign requirements", "status": "Matched"},
                {"label": "Minimum reputation threshold satisfied", "status": "Passed"},
                {"label": "Contribution package uses selected benchmark fields only", "status": "Passed"},
                {"label": "Confidence tier meets campaign policy", "status": "Qualified"},
                {"label": "Confidential processing enabled", "status": "Active" if campaign.tee_processing_enabled else "Disabled"},
                {"label": "Raw data retention outside processing boundary", "status": "None"},
            ],
            "submission_weights": [
                {"type": "Self-reported", "weight": "Standard", "treatment": "Lower confidence contribution"},
                {"type": "System-signed", "weight": "Elevated", "treatment": "Strong benchmark inclusion after review"},
                {"type": "Oracle / custodian-attested", "weight": "Highest", "treatment": "Maximum policy weight when external attestation is available"},
            ],
            "quality_note": (
                "Contribution quality affects benchmark strength, attestation coverage, and confidence. "
                "The Institution Desk submits a selected contribution package, not full raw institutional positions."
            ),
        }
        return package, policy

    def get_overview(self, institution_id: int = 1):
        snapshot = self.repo.get_snapshot()
        output = self.repo.get_output_for_institution(institution_id, snapshot.id)
        campaign = self.repo.get_active_campaign()
        latest_run = self.repo.get_latest_run_for_campaign(campaign.id if campaign else snapshot.campaign_id)
        submission = next(
            (
                item
                for item in self.repo.list_submissions(campaign_id=campaign.id if campaign else None)
                if item.institution_id == institution_id
            ),
            None,
        )
        distribution = snapshot.distribution_json
        last_refresh = snapshot.created_at.strftime("%Y-%m-%d %H:%M UTC")
        submission_status = submission.review_status.replace("_", " ").title() if submission else "Ready to Submit"
        submitted_on = f"Submitted {submission.submitted_at.strftime('%b')} {submission.submitted_at.day}" if submission else "Package prepared"
        return self.projections.overview_projection(
            "institution_desk",
            [
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%"),
                MetricDTO(label="Attested Coverage", value=pct(snapshot.attested_coverage)),
                MetricDTO(label="Cohort Depth", value=f"{snapshot.contributor_count} contributors"),
                MetricDTO(label="Active Campaigns", value=str(len(self.repo.campaigns))),
                MetricDTO(label="Network Liquidity", value="Stable" if "LIQUIDITY_OK" in snapshot.alerts_json else "Review", tone="neutral"),
                MetricDTO(label="Dispersion", value=f"{snapshot.dispersion:.1f} pts", detail="Elevated", tone="warning"),
                MetricDTO(label="Confidential Boundary", value="Active", detail=latest_run.runtime_mode.replace("_", " ").title(), tone="positive"),
                MetricDTO(label="Last Refresh", value=last_refresh),
                MetricDTO(
                    label="Own Contribution Status",
                    value=submission_status,
                    detail="Latest institution submission state",
                ),
                MetricDTO(label="Own Benchmark Teaser", value=f"{output.delta_vs_benchmark:+.1f} pts", detail="Delta vs active benchmark"),
            ],
            [
                "Contribution status, benchmark context, and next actions for the institution desk.",
                output.suggested_interpretation,
            ],
            [
                ActionDTO(title="Submit Contribution", body="Submit or revise the active campaign package."),
                ActionDTO(title="Compare to My Position", body="Open institution-scoped benchmark interpretation."),
            ],
            {
                "benchmark": {
                    "title": campaign.scenario if campaign else snapshot.scenario,
                    "average_liquidity": f"{snapshot.average_liquidity:.1f}",
                    "delta": f"{output.delta_vs_benchmark:+.1f} pts vs. network average",
                    "top_quartile": str(distribution.get("top_quartile", "n/a")),
                    "median": str(distribution.get("median", "n/a")),
                    "bottom_quartile": str(distribution.get("bottom_quartile", "n/a")),
                    "interpretation": "Liquidity score sits in the upper half of the active cohort",
                },
                "contribution_cards": [
                    {
                        "title": "Liquidity Contribution",
                        "status": submitted_on,
                        "action": "View Submission" if submission else "Submit Contribution",
                        "tone": "success" if submission else "action",
                    },
                    {
                        "title": "Attestation Package",
                        "status": submission.attestation_status.replace("_", " ").title() if submission else "Not started",
                        "action": "Review & Attest",
                        "tone": "action",
                    },
                    {
                        "title": "Next Contribution Draft",
                        "status": f"{campaign.submission_window_end.strftime('%b')} {campaign.submission_window_end.day} window close" if campaign else "No active window",
                        "action": "Prepare Draft",
                        "tone": "ghost",
                    },
                ],
                "network_intelligence": {
                    "subtitle": "Strategic interpretation of anonymized contribution across the active benchmark cohort",
                    "eyebrow": "Strategic Network Signal",
                    "headline": output.suggested_interpretation,
                    "body": (
                        "Anonymized contribution continues to produce benchmark-level intelligence without "
                        "exposing institution-level positions."
                    ),
                    "route": "benchmark",
                },
                "recent_intelligence": [
                    {
                        "category": "network_liquidity",
                        "title": "Repo liquidity remains resilient despite higher tenor dispersion across attested contributors.",
                        "meta": "Updated from active benchmark snapshot",
                        "route": "benchmark",
                    },
                    {
                        "category": "institution_benchmark",
                        "title": output.explainable_summary,
                        "meta": "Alpha Bank institution-level benchmark update",
                        "route": "position",
                    },
                    {
                        "category": "processing_reliability",
                        "title": "Confidential processing reliability remains above target for the active campaign cohort.",
                        "meta": "Reliability checkpoint passed",
                        "route": "processing",
                    },
                ],
            },
        )

    def get_contribute_view(self, institution_id: int, campaign_id: int):
        package, policy = self._desk_contribution_package(institution_id, campaign_id)
        return self.projections.campaign_projection(
            campaign_id,
            [ActionDTO(title="Submit Contribution", body="Submit selected fields under campaign policy.")],
            institution_id=institution_id,
            contribution_package=package,
            contribution_policy=policy,
        )

    def get_processing_view(self, institution_id: int, run_id: int):
        run = self.repo.get_run(run_id)
        campaign = self.repo.get_campaign(run.campaign_id)
        submission = self.repo.get_latest_submission_for_institution(run.campaign_id, institution_id)
        contribution_received = submission is not None
        benchmark_ready = run.run_status in {"completed", "release_pending", "released"} and bool(run.attestation_ref)
        context = {
            "campaign_title": campaign.title,
            "contribution_type": submission.submission_type if submission else "System-signed",
            "contribution_status": submission.review_status.replace("_", " ").title() if submission else "Not received",
            "contribution_received": contribution_received,
            "simulated_tee_status": (
                "Completed"
                if benchmark_ready
                else "Standby - package received"
                if contribution_received
                else "Standby - waiting for contribution"
            ),
            "policy_checks": "Passed" if contribution_received else "Not started",
            "benchmark_readiness": "Ready" if benchmark_ready else "Not ready",
            "benchmark_ready": benchmark_ready,
            "raw_data_exposure": "None",
            "retention": "None outside confidential boundary",
            "attestation_ref": run.attestation_ref or ("ATT-SIM-0001" if contribution_received else "Pending"),
            "safe_summary": (
                "Selected contribution fields are processed inside a simulated TEE confidential boundary before derived benchmark outputs are released."
            ),
            "disclosure_summary": (
                "Raw package values are not exposed in Institution Desk, Operator, Auditor, or peer benchmark views."
            ),
            "released_scope": (
                "Only derived benchmark metrics, institution-scoped outputs, and attestation references are released."
            ),
        }
        return self.projections.processing_projection(
            run_id,
            [ActionDTO(title="View Attestation Record", body="Open the runtime reference for this processing run.")],
            processing_context=context,
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
        pending = self.repo.list_pending_operator_submissions()
        latest_run = self.repo.get_latest_run_for_campaign(1)
        return self.projections.overview_projection(
            "operator",
            [
                MetricDTO(label="Active Campaigns", value=str(len(self.repo.campaigns))),
                MetricDTO(label="Contributor Depth", value=str(snapshot.contributor_count)),
                MetricDTO(label="Attested Coverage", value=pct(snapshot.attested_coverage)),
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%"),
                MetricDTO(label="Pending Validations", value=str(len(pending))),
                MetricDTO(label="Processing Health", value=latest_run.run_status.replace("_", " ").title()),
                MetricDTO(label="Release Readiness", value=str(latest_run.notes_json.get("release_readiness", "draft")).replace("_", " ").title()),
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
        run = self.repo.get_run(run_id)
        return self.projections.processing_projection(
            run_id,
            [
                ActionDTO(title="Trigger Benchmark Run", body="Start or rerun benchmark computation."),
                ActionDTO(title="Approve Release", body=f"Approve ready output packages from {run.run_status.replace('_', ' ')} state."),
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
        latest_run = self.repo.get_latest_run_for_campaign(snapshot.campaign_id)
        latest_record = max(self.repo.audit_records.values(), key=lambda item: item.id)
        return self.projections.overview_projection(
            "auditor",
            [
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%"),
                MetricDTO(label="Attestation Coverage", value=pct(snapshot.attested_coverage)),
                MetricDTO(label="Release Scope", value="Derived outputs only"),
                MetricDTO(label="Retention Compliance", value="Enforced"),
                MetricDTO(label="Audit Trail Status", value="Current"),
                MetricDTO(label="Last Recorded Run", value=f"Run {latest_run.id}", detail=latest_run.run_status.replace("_", " ").title()),
                MetricDTO(label="Record Lifecycle", value=latest_record.record_status.replace("_", " ").title(), detail=latest_record.canton_record_ref or "Canton reference pending"),
            ],
            ["Audit-oriented summary of reliability, attestation coverage, release scope, retention controls, and record lifecycle state."],
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
            include_recommendations=False,
        )

    def get_audit_record(self, record_id: int):
        return self.projections.audit_projection(
            record_id,
            [
                ActionDTO(title="Open Evidence Package", body="Inspect release scope and attestation evidence."),
                ActionDTO(title="View Audit Trail", body="Review Canton recording lifecycle."),
            ],
        )
