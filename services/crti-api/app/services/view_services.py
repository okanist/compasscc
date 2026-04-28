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
        benchmark_ready = submission is not None
        benchmark_section = (
            {
                "title": campaign.scenario if campaign else snapshot.scenario,
                "average_liquidity": f"{snapshot.average_liquidity:.1f}",
                "delta": f"{output.delta_vs_benchmark:+.1f} pts vs. network average",
                "top_quartile": str(distribution.get("top_quartile", "n/a")),
                "median": str(distribution.get("median", "n/a")),
                "bottom_quartile": str(distribution.get("bottom_quartile", "n/a")),
                "interpretation": "Liquidity score sits in the upper half of the active cohort",
            }
            if benchmark_ready
            else {
                "title": campaign.scenario if campaign else snapshot.scenario,
                "average_liquidity": "Benchmark pending",
                "delta": "Submit contribution to generate benchmark intelligence",
                "top_quartile": "Pending",
                "median": "Pending",
                "bottom_quartile": "Pending",
                "interpretation": "Benchmark intelligence becomes available after Alpha Bank submits its prepared contribution package and confidential processing is ready.",
            }
        )
        network_section = (
            {
                "subtitle": "Strategic interpretation of anonymized contribution across the active benchmark cohort",
                "eyebrow": "Strategic Network Signal",
                "headline": output.suggested_interpretation,
                "body": (
                    "Anonymized contribution continues to produce benchmark-level intelligence without "
                    "exposing institution-level positions."
                ),
                "route": "benchmark",
            }
            if benchmark_ready
            else {
                "subtitle": "Benchmark intelligence pending contribution submission",
                "eyebrow": "Contribution Ready",
                "headline": "Alpha Bank's prepared package is ready to submit.",
                "body": "Submit the prepared contribution package to unlock simulated confidential processing and derived benchmark intelligence.",
                "route": "campaign",
            }
        )
        recent_intelligence = (
            [
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
            ]
            if benchmark_ready
            else [
                {
                    "category": "network_liquidity",
                    "title": "Benchmark intelligence is pending Alpha Bank's contribution submission.",
                    "meta": "Submit contribution to generate network benchmark outputs",
                    "route": "benchmark",
                },
                {
                    "category": "institution_benchmark",
                    "title": "Alpha Bank's institution-scoped comparison is not ready yet.",
                    "meta": "My Position unlocks after contribution and processing readiness",
                    "route": "position",
                },
                {
                    "category": "processing_reliability",
                    "title": "Confidential processing is waiting for the prepared contribution package.",
                    "meta": "Processing not started",
                    "route": "processing",
                },
            ]
        )
        return self.projections.overview_projection(
            "institution_desk",
            [
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%" if benchmark_ready else "Pending"),
                MetricDTO(label="Attested Coverage", value=pct(snapshot.attested_coverage) if benchmark_ready else "Awaiting contribution"),
                MetricDTO(label="Cohort Depth", value=f"{snapshot.contributor_count} contributors" if benchmark_ready else "Prepared contributors pending"),
                MetricDTO(label="Active Campaigns", value=str(len(self.repo.campaigns))),
                MetricDTO(label="Network Liquidity", value="Stable" if benchmark_ready and "LIQUIDITY_OK" in snapshot.alerts_json else "Pending", tone="neutral"),
                MetricDTO(label="Dispersion", value=f"{snapshot.dispersion:.1f} pts" if benchmark_ready else "Pending", detail="Elevated" if benchmark_ready else "Awaiting benchmark run", tone="warning" if benchmark_ready else "neutral"),
                MetricDTO(label="Confidential Boundary", value="Active", detail=latest_run.runtime_mode.replace("_", " ").title(), tone="positive"),
                MetricDTO(label="Last Refresh", value=last_refresh if benchmark_ready else "Awaiting first benchmark refresh"),
                MetricDTO(
                    label="Own Contribution Status",
                    value=submission_status,
                    detail="Latest institution submission state",
                ),
                MetricDTO(label="Own Benchmark Teaser", value=f"{output.delta_vs_benchmark:+.1f} pts" if benchmark_ready else "Pending", detail="Delta vs active benchmark" if benchmark_ready else "Submit contribution to unlock"),
            ],
            [
                "Contribution status, benchmark context, and next actions for the institution desk.",
                output.suggested_interpretation if benchmark_ready else "Alpha Bank has a prepared contribution package ready to submit. Benchmark intelligence is pending contribution and confidential processing readiness.",
            ],
            [
                ActionDTO(title="Submit Contribution", body="Submit or revise the active campaign package."),
                ActionDTO(title="Compare to My Position", body="Open institution-scoped benchmark interpretation."),
            ],
            {
                "overview_context": {
                    "benchmark_ready": benchmark_ready,
                    "next_action": "view_benchmark" if benchmark_ready else "submit_contribution",
                    "message": "Benchmark intelligence ready." if benchmark_ready else "Submit contribution to generate benchmark intelligence.",
                },
                "benchmark": benchmark_section,
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
                "network_intelligence": network_section,
                "recent_intelligence": recent_intelligence,
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
        attestation_ref = run.attestation_ref
        try:
            attestation_ref = attestation_ref or self.repo.get_attestation_for_run(run.id).ref_code
        except StopIteration:
            attestation_ref = attestation_ref
        output_ready = any(
            item.processing_run_id == run.id and item.institution_id == institution_id
            for item in self.repo.outputs.values()
        )
        run_ready = run.run_status in {"completed", "release_pending", "released"} and bool(attestation_ref)
        simulated_ready = contribution_received and output_ready and bool(attestation_ref)
        benchmark_ready = run_ready or simulated_ready
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
            "next_action": "view_benchmark" if benchmark_ready else "submit_contribution",
            "raw_data_exposure": "None",
            "retention": "None outside confidential boundary",
            "attestation_ref": attestation_ref or ("ATT-SIM-0001" if contribution_received else "Pending"),
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
        campaign = self.repo.get_active_campaign()
        campaign_id = campaign.id if campaign else 1
        run = self.repo.get_latest_run_for_campaign(campaign_id)
        submission = self.repo.get_latest_submission_for_institution(campaign_id, institution_id)
        contribution_received = submission is not None
        attestation_ref = run.attestation_ref
        try:
            attestation_ref = attestation_ref or self.repo.get_attestation_for_run(run.id).ref_code
        except StopIteration:
            attestation_ref = attestation_ref
        output_ready = any(
            item.processing_run_id == run.id and item.institution_id == institution_id
            for item in self.repo.outputs.values()
        )
        run_ready = run.run_status in {"completed", "release_pending", "released"} and bool(attestation_ref)
        benchmark_ready = run_ready or (contribution_received and output_ready and bool(attestation_ref))
        snapshot = self.repo.get_snapshot_by_scenario(scenario)
        scenario_options = sorted({item.scenario for item in self.repo.snapshots.values()})
        not_ready_message = (
            "Benchmark intelligence is not ready yet. Alpha Bank must submit its prepared contribution package "
            "and complete simulated confidential processing before cohort-level benchmark intelligence is shown."
        )
        benchmark_context = {
            "benchmark_ready": benchmark_ready,
            "benchmark_readiness": "Ready" if benchmark_ready else "Not ready",
            "next_action": "view_benchmark" if benchmark_ready else "submit_contribution",
            "selected_scenario": snapshot.scenario,
            "scenario_options": scenario_options,
            "active_cohort": f"{snapshot.contributor_count} contributors" if benchmark_ready else None,
            "attested_coverage": f"{snapshot.attested_coverage * 100:.0f}%" if benchmark_ready else None,
            "last_refresh": snapshot.created_at.isoformat() if benchmark_ready else None,
            "network_signal_summary": (
                f"Derived cohort intelligence shows average liquidity at {snapshot.average_liquidity:.1f}/100, "
                f"benchmark reliability at {snapshot.reliability_score:.1f}%, and liquidity dispersion at {snapshot.dispersion:.1f} pts."
                if benchmark_ready
                else not_ready_message
            ),
            "confidence_notes": [
                "Signals reflect cohort-level benchmark behavior, not institution-specific raw contribution values.",
                "Benchmark reliability depends on contribution depth, attested coverage, and confidence tier.",
                "All outputs shown here are derived from anonymized benchmark computation inside the simulated confidential boundary.",
            ] if benchmark_ready else [],
            "not_ready_message": not_ready_message,
        }
        return self.projections.benchmark_projection(
            scenario,
            [ActionDTO(title="Compare to My Position", body="Open institution-scoped comparison output.")],
            benchmark_context=benchmark_context,
            expose_outputs=benchmark_ready,
        )

    def get_my_position(self, institution_id: int, scenario: str | None):
        campaign = self.repo.get_active_campaign()
        campaign_id = campaign.id if campaign else 1
        run = self.repo.get_latest_run_for_campaign(campaign_id)
        submission = self.repo.get_latest_submission_for_institution(campaign_id, institution_id)
        contribution_received = submission is not None
        snapshot = self.repo.get_snapshot_by_scenario(scenario)
        attestation_ref = run.attestation_ref
        try:
            attestation_ref = attestation_ref or self.repo.get_attestation_for_run(run.id).ref_code
        except StopIteration:
            attestation_ref = attestation_ref
        output = self.repo.get_output_for_institution(institution_id, snapshot.id)
        output_ready = contribution_received and output.processing_run_id == run.id and bool(attestation_ref)
        audit_record = self.repo.get_audit_record_for_output(output.id) if output_ready else None
        record_status = audit_record.record_status if audit_record else "draft"
        recordable = output_ready and output.release_status in {"approved", "published"} and record_status != "finalized"
        output_context = {
            "output_ready": output_ready,
            "recordable": recordable,
            "next_action": "record_to_canton" if recordable else "view_benchmark" if output_ready else "submit_contribution",
            "selected_scenario": snapshot.scenario,
            "institution_name": self.repo.get_institution(institution_id).name,
            "benchmark_reference": f"Benchmark snapshot {snapshot.id}" if output_ready else None,
            "output_id": output.id if output_ready else None,
            "record_lifecycle": record_status if output_ready else "not_ready",
            "canton_record_ref": audit_record.canton_record_ref if audit_record else None,
            "created_at": output.created_at.isoformat() if output_ready else None,
            "recorded_at": audit_record.recorded_at.isoformat() if audit_record and audit_record.recorded_at else None,
            "privacy_summary": "Outputs are derived from anonymized benchmark computation and Alpha Bank's scoped comparison package.",
            "not_ready_message": (
                "Institution position output is not ready yet. Alpha Bank must submit its prepared contribution package "
                "and benchmark intelligence must be ready before this scoped comparison is released."
            ),
        }
        return self.projections.institution_output_projection(
            institution_id,
            scenario,
            [ActionDTO(title="Record to Canton", body="Prepare the institution-scoped output record.")],
            output_context=output_context,
            expose_output=output_ready,
        )


class OperatorViewService(BaseViewService):
    def get_overview(self):
        snapshot = self.repo.get_snapshot()
        pending = self.repo.list_pending_operator_submissions()
        latest_run = self.repo.get_latest_run_for_campaign(1)
        approved = self.repo.list_submissions(campaign_id=1, review_status="approved")
        trigger_enabled = len(pending) == 0 and len(approved) > 0 and latest_run.run_status == "not_started"
        trigger_message = (
            "Ready to trigger benchmark processing."
            if trigger_enabled
            else "Review submitted contribution packages before triggering benchmark processing."
            if pending
            else f"Processing run is {latest_run.run_status.replace('_', ' ')}."
        )
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
            overview_sections={
                "operator": {
                    "pending_validations": len(pending),
                    "approved_submissions": len(approved),
                    "trigger_enabled": trigger_enabled,
                    "trigger_message": trigger_message,
                    "campaign_id": 1,
                    "latest_run_id": latest_run.id,
                    "processing_health": latest_run.run_status,
                    "release_readiness": str(latest_run.notes_json.get("release_readiness", "draft")),
                }
            },
        )

    def get_campaign_view(self, campaign_id: int):
        return self.projections.campaign_projection(
            campaign_id,
            [
                ActionDTO(title="Review Submission", body="Review pending submissions."),
                ActionDTO(title="Approve Release", body="Approve benchmark release once processing is complete and release checks are ready."),
            ],
        )

    def get_processing_view(self, run_id: int):
        run = self.repo.get_run(run_id)
        campaign = self.repo.get_campaign(run.campaign_id)
        pending = self.repo.list_pending_operator_submissions()
        approved = self.repo.list_submissions(campaign_id=run.campaign_id, review_status="approved")
        release_readiness = str(run.notes_json.get("release_readiness", "draft"))
        trigger_enabled = len(pending) == 0 and len(approved) > 0 and run.run_status == "not_started"
        approve_release_enabled = run.run_status in {"completed", "release_pending"} and release_readiness != "approved"
        if run.run_status == "not_started" and pending:
            lifecycle = [
                "contribution package received" if any(item.institution_id == 1 for item in pending) else "waiting for institution contribution package",
                "pending submissions must be reviewed",
                "ready for simulated TEE processing after review",
                "derived outputs not generated",
            ]
        elif run.run_status == "not_started":
            lifecycle = [
                "contribution packages reviewed" if approved else "waiting for institution contribution package",
                "ready for simulated TEE processing" if trigger_enabled else "confidential processing not started",
                "no processing run triggered",
                "derived outputs not generated",
            ]
        elif run.run_status == "released":
            lifecycle = [
                "simulated TEE processing completed",
                "derived outputs generated",
                "release approved",
                "institution outputs available",
                "audit handoff ready",
            ]
        else:
            lifecycle = [
                "contribution package reviewed",
                "simulated TEE processing completed",
                "derived outputs generated",
                "release pending",
            ]
        context = {
            "campaign_title": campaign.title,
            "scenario": campaign.scenario,
            "pending_reviews": len(pending),
            "approved_submissions": len(approved),
            "trigger_enabled": trigger_enabled,
            "trigger_message": (
                "Ready to trigger benchmark processing."
                if trigger_enabled
                else "Pending submissions must be reviewed before benchmark processing can start."
                if pending
                else f"Processing run is {run.run_status.replace('_', ' ')}."
            ),
            "approve_release_enabled": approve_release_enabled,
            "approve_release_message": (
                "Approve derived benchmark outputs for release."
                if approve_release_enabled
                else "Benchmark release approved."
                if release_readiness == "approved" or run.run_status == "released"
                else "Release approval becomes available after benchmark processing completes."
            ),
            "release_readiness": release_readiness,
            "simulated_tee_status": "Completed" if run.run_status != "not_started" else "Not started",
            "raw_data_exposure": "None",
            "output_available": run.run_status == "released",
            "lifecycle": lifecycle,
        }
        return self.projections.processing_projection(
            run_id,
            [
                ActionDTO(title="Trigger Benchmark Run", body=context["trigger_message"]),
                ActionDTO(title="Approve Release", body=context["approve_release_message"]),
            ],
            processing_context=context,
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
        output = self.repo.get_output_for_institution(institution_id, snapshot.id)
        audit_record = self.repo.get_audit_record_for_output(output.id)
        run = self.repo.get_run(output.processing_run_id)
        release_ready = output.release_status in {"approved", "published"} and run.run_status == "released"
        output_context = {
            "output_ready": release_ready,
            "recordable": False,
            "selected_scenario": snapshot.scenario,
            "institution_name": self.repo.get_institution(institution_id).name,
            "benchmark_reference": f"Benchmark snapshot {snapshot.id}" if release_ready else None,
            "output_id": output.id if release_ready else None,
            "record_lifecycle": audit_record.record_status if audit_record and release_ready else "not_ready",
            "canton_record_ref": audit_record.canton_record_ref if audit_record and release_ready else None,
            "created_at": output.created_at.isoformat() if release_ready else None,
            "recorded_at": audit_record.recorded_at.isoformat() if audit_record and audit_record.recorded_at and release_ready else None,
            "privacy_summary": "Operator-safe release and handoff review of an institution-scoped derived output package.",
            "not_ready_message": (
                "Institution output is not available for operator handoff review until benchmark processing is complete "
                "and release approval has been recorded."
            ),
        }
        return self.projections.institution_output_projection(
            institution_id,
            snapshot.scenario,
            [
                ActionDTO(title="Back to Processing", body="Return to processing and release readiness controls."),
                ActionDTO(title="Back to Benchmark Operations", body="Review scenario-wide benchmark construction status."),
            ],
            include_recommendations=False,
            output_context=output_context,
            expose_output=release_ready,
        )


class AuditorViewService(BaseViewService):
    def get_overview(self):
        snapshot = self.repo.get_snapshot()
        latest_run = self.repo.get_latest_run_for_campaign(snapshot.campaign_id)
        latest_record = max(self.repo.audit_records.values(), key=lambda item: item.id, default=None)
        release_status = str(latest_run.notes_json.get("release_status", "draft"))
        release_ready = latest_run.run_status == "released" or release_status in {"approved", "published"}
        finalized_record_available = bool(latest_record and latest_record.record_status == "finalized")
        release_scope = [
            "Benchmark reliability package",
            "Cohort-level benchmark metrics",
            "Institution-scoped comparison output",
            "Attestation reference",
            "No raw institutional contribution data",
        ]

        if release_ready:
            metrics = [
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%", detail="Released benchmark reliability"),
                MetricDTO(label="Attestation Coverage", value=pct(snapshot.attested_coverage), detail="Released benchmark attestation coverage"),
                MetricDTO(label="Release Scope", value="Derived outputs only", detail="Raw institution and peer payloads excluded"),
                MetricDTO(label="Retention Compliance", value="Enforced", detail="No raw payload retention outside the confidential boundary"),
                MetricDTO(label="Audit Trail Status", value="Current" if finalized_record_available else "Release available", detail="Read-only audit trail available"),
                MetricDTO(label="Last Recorded Run", value=f"Run {latest_run.id} / Released", detail=latest_run.finished_at.isoformat() if latest_run.finished_at else "Release approved"),
                MetricDTO(
                    label="Record Lifecycle",
                    value=latest_record.record_status.replace("_", " ").title() if latest_record else "Draft",
                    detail=(latest_record.canton_record_ref if latest_record and latest_record.canton_record_ref else "Canton-style reference pending"),
                ),
            ]
            summary = "Latest released benchmark evidence is available for read-only audit review."
            message = "Released benchmark package available. Auditor review is read-only and exposes derived outputs only."
        else:
            metrics = [
                MetricDTO(label="Benchmark Reliability", value="Awaiting release", detail="No released benchmark run is available yet"),
                MetricDTO(label="Attestation Coverage", value="Awaiting release", detail="Coverage is shown after benchmark release"),
                MetricDTO(label="Release Scope", value="Not released", detail="Derived output package is awaiting release approval"),
                MetricDTO(label="Retention Compliance", value="Policy configured", detail="No raw payload retention policy is configured for processing"),
                MetricDTO(label="Audit Trail Status", value="Pending", detail="Audit trail finalization becomes current after release"),
                MetricDTO(label="Last Recorded Run", value="No released run", detail=latest_run.run_status.replace("_", " ").title()),
                MetricDTO(label="Record Lifecycle", value="Not finalized", detail="No finalized audit record for the latest release"),
            ]
            summary = "Audit package is awaiting benchmark release. No finalized benchmark outputs are shown before release readiness."
            message = "No released benchmark package is available yet. Review processing evidence or wait for operator release approval."

        return self.projections.overview_projection(
            "auditor",
            metrics,
            [summary],
            [
                ActionDTO(title="View Audit Package", body="Open benchmark and output evidence package."),
                ActionDTO(title="View Audit Trail", body="Review release and evidence events."),
            ],
            overview_sections={
                "auditor": {
                    "release_ready": release_ready,
                    "package_available": release_ready,
                    "audit_trail_available": bool(self.repo.audit_records),
                    "message": message,
                    "release_scope": release_scope if release_ready else [
                        "Release package awaiting approval",
                        "Derived outputs only when released",
                        "No raw institutional contribution data",
                        "No raw peer positions",
                    ],
                    "last_run_id": latest_run.id,
                    "last_run_status": latest_run.run_status,
                    "record_lifecycle": latest_record.record_status if latest_record and release_ready else "not_finalized",
                    "record_reference": latest_record.canton_record_ref if latest_record and release_ready else None,
                }
            },
        )

    def get_policy_review(self, campaign_id: int):
        campaign = self.repo.get_campaign(campaign_id)
        submissions = self.repo.list_submissions(campaign_id=campaign_id)
        latest_run = self.repo.get_latest_run_for_campaign(campaign_id)
        pending = [item for item in submissions if item.review_status in {"submitted", "under_review"}]
        release_status = str(latest_run.notes_json.get("release_status", "draft"))
        released = latest_run.run_status == "released" or release_status in {"approved", "published"}
        finalized_record = next((item for item in self.repo.audit_records.values() if item.record_status == "finalized"), None)
        policy = {
            "policy_status": "Active",
            "accepted_submission_classes": [
                {
                    "type": "Self-reported",
                    "benchmark_weight": "Standard",
                    "attestation_rule": "Accepted for review; lower reliability weighting",
                    "evidence_status": "Configured",
                },
                {
                    "type": "System-signed",
                    "benchmark_weight": "Elevated",
                    "attestation_rule": "System-signed package metadata required",
                    "evidence_status": "Configured",
                },
                {
                    "type": "Oracle / custodian-attested",
                    "benchmark_weight": "Highest",
                    "attestation_rule": "Policy-recognized custodian-attested submissions; no live external integration in the MVP",
                    "evidence_status": "Policy-recognized",
                },
            ],
            "attestation_rules_state": "Configured",
            "policy_enforcement_state": (
                "Enforced / Passing"
                if released
                else "Pending review" if pending else "Configured / Awaiting submissions"
            ),
            "retention_controls": "No raw contribution payload retention outside the confidential boundary",
            "out_of_policy_rule": "Out-of-policy contributions remain review-only and are excluded from benchmark release until resolved.",
            "weight_mapping": [
                "Self-reported -> Standard benchmark weight",
                "System-signed -> Elevated benchmark weight",
                "Policy-recognized custodian-attested -> Highest benchmark weight when attestation evidence exists",
            ],
            "evidence_context": {
                "campaign_title": campaign.title,
                "scenario": campaign.scenario,
                "policy_status": "Active",
                "accepted_classes_count": 3,
                "pending_reviews": len(pending),
                "submitted_packages": len(submissions),
                "released_cycle": released,
                "record_lifecycle": finalized_record.record_status if finalized_record else "not_finalized",
                "record_reference": finalized_record.canton_record_ref if finalized_record else None,
                "message": (
                    "Policy evidence is enforced for the released benchmark cycle."
                    if released
                    else "Contribution policy is configured. Release-specific policy evidence becomes final after operator release."
                ),
            },
        }
        return self.projections.campaign_projection(
            campaign_id,
            [
                ActionDTO(title="Open Evidence Package", body="Inspect policy controls, accepted classes, and attestation rules."),
                ActionDTO(title="View Audit Trail", body="Review contribution policy events."),
            ],
            contribution_policy=policy,
            expose_submissions=False,
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
        requested_snapshot = self.repo.get_snapshot(snapshot_id)
        latest_snapshot = self.repo.get_latest_snapshot_for_campaign(requested_snapshot.campaign_id)
        snapshot = latest_snapshot if latest_snapshot.id > requested_snapshot.id else requested_snapshot
        run = self.repo.get_run(snapshot.processing_run_id)
        release_status = str(run.notes_json.get("release_status", "draft"))
        release_ready = run.run_status == "released" or release_status in {"approved", "published"}
        release_pending = run.run_status == "release_pending" or release_status == "release_pending"
        attestation = None if run.run_status == "not_started" else self.repo.get_attestation_for_run(run.id)
        output = next((item for item in self.repo.outputs.values() if item.benchmark_snapshot_id == snapshot.id), None)
        audit_record = next(
            (
                item
                for item in self.repo.audit_records.values()
                if item.benchmark_snapshot_id == snapshot.id and item.record_status == "finalized"
            ),
            None,
        )
        if audit_record is None and output:
            audit_record = self.repo.get_audit_record_for_output(output.id)
        submitted = self.repo.list_submissions(campaign_id=snapshot.campaign_id)
        approved = [item for item in submitted if item.review_status == "approved"]
        return self.projections.benchmark_projection(
            snapshot.scenario,
            [
                ActionDTO(title="Open Evidence Package", body="Inspect benchmark and processing evidence without raw contribution payloads."),
                ActionDTO(title="View Audit Trail", body="Review the read-only audit record and release trail."),
                ActionDTO(title="View Output Audit", body="Review institution-scoped derived output audit evidence when available."),
            ],
            benchmark_context={
                "requested_snapshot_id": requested_snapshot.id,
                "snapshot_id": snapshot.id if release_ready or release_pending else None,
                "run_id": run.id,
                "campaign_id": snapshot.campaign_id,
                "scenario": snapshot.scenario,
                "release_status": "approved" if release_ready else "release_pending" if release_pending else "draft",
                "release_readiness": str(run.notes_json.get("release_readiness", "draft")),
                "released": release_ready,
                "release_pending": release_pending,
                "last_released_at": run.finished_at.isoformat() if release_ready and run.finished_at else None,
                "run_status": run.run_status,
                "runtime_mode": run.runtime_mode,
                "retention_policy_status": run.retention_policy_status,
                "attestation_ref": run.attestation_ref,
                "evidence_refs": [attestation.ref_code, "runtime-manifest", "retention-checkpoint"] if attestation else [],
                "benchmark_snapshot_ref": f"Benchmark snapshot {snapshot.id}" if release_ready else None,
                "release_ref": f"Release run {run.id}" if release_ready else None,
                "audit_record_id": audit_record.id if audit_record else None,
                "audit_record_status": audit_record.record_status if audit_record else "not_started",
                "audit_record_ref": audit_record.canton_record_ref if audit_record and audit_record.record_status == "finalized" else None,
                "cohort_depth": snapshot.contributor_count if release_ready else None,
                "contribution_mix": f"{len(approved)} approved / {len(submitted)} submitted",
                "verified_mix": f"{run.valid_submission_count} verified / {run.input_count} processed",
                "derived_outputs_only": True,
            },
        )

    def get_institution_output_audit(self, institution_id: int, output_id: int):
        requested_output = self.repo.get_output(output_id)
        latest_output = self.repo.get_output_for_institution(institution_id)
        output = latest_output if latest_output.benchmark_snapshot_id > requested_output.benchmark_snapshot_id else requested_output
        snapshot = self.repo.get_snapshot(output.benchmark_snapshot_id)
        run = self.repo.get_run(output.processing_run_id)
        release_status = str(run.notes_json.get("release_status", "draft"))
        release_ready = output.release_status in {"approved", "published"} and (
            run.run_status == "released" or release_status in {"approved", "published"}
        )
        release_pending = run.run_status == "release_pending" or release_status == "release_pending"
        audit_record = self.repo.get_audit_record_for_output(output.id)
        output_context = {
            "selected_institution": self.repo.get_institution(institution_id).name,
            "output_id": output.id if release_ready or release_pending else None,
            "scenario": snapshot.scenario,
            "benchmark_reference": f"Benchmark snapshot {snapshot.id}" if release_ready or release_pending else None,
            "snapshot_reference": f"Snapshot {snapshot.id}" if release_ready or release_pending else None,
            "snapshot_id": snapshot.id if release_ready or release_pending else None,
            "run_id": run.id,
            "release_status": "approved" if release_ready else "release_pending" if release_pending else "draft",
            "output_status": "available" if release_ready else "release_gated" if release_pending else "unavailable",
            "benchmark_delta": output.delta_vs_benchmark if release_ready else None,
            "confidence": output.confidence_level if release_ready else None,
            "risk_tier": output.risk_tier if release_ready else None,
            "handoff_readiness": "package_ready" if release_ready else "release_pending" if release_pending else "awaiting_benchmark_release",
            "record_lifecycle": audit_record.record_status if audit_record and release_ready else "not_ready",
            "canton_record_ref": audit_record.canton_record_ref if audit_record and audit_record.record_status == "finalized" else None,
            "generated_at": output.created_at.isoformat() if release_ready else None,
            "released_at": run.finished_at.isoformat() if release_ready and run.finished_at else None,
            "finalized_at": audit_record.recorded_at.isoformat() if audit_record and audit_record.recorded_at and release_ready else None,
            "output_ready": release_ready,
            "release_pending": release_pending,
            "not_ready_message": "Institution-scoped output audit is awaiting benchmark release approval.",
            "release_scope": [
                "Institution-scoped derived output",
                "Benchmark delta and confidence metadata",
                "Release-approved output package" if release_ready else "Release-gated output package",
                "Record lifecycle",
                "No raw institutional contribution data",
            ],
        }
        return self.projections.institution_output_projection(
            institution_id,
            snapshot.scenario,
            [
                ActionDTO(title="Open Output Evidence Package", body="Inspect the institution-scoped derived output evidence summary."),
                ActionDTO(title="View Benchmark Audit", body="Review benchmark release audit evidence."),
                ActionDTO(title="View Audit Trail", body="Open read-only audit record evidence."),
            ],
            include_recommendations=False,
            output_context=output_context,
            expose_output=False,
        )

    def get_audit_record(self, record_id: int):
        requested_record = self.repo.audit_records.get(record_id)
        finalized_record = max(
            (item for item in self.repo.audit_records.values() if item.record_status == "finalized"),
            key=lambda item: item.id,
            default=None,
        )
        latest_output = self.repo.get_output_for_institution(1)
        latest_run = self.repo.runs.get(latest_output.processing_run_id)
        latest_release_status = str(latest_run.notes_json.get("release_status", "draft")) if latest_run else "draft"
        latest_release_ready = bool(
            latest_run
            and latest_output.release_status in {"approved", "published"}
            and (latest_run.run_status == "released" or latest_release_status in {"approved", "published"})
        )
        latest_output_record = self.repo.get_audit_record_for_output(latest_output.id) if latest_release_ready else None
        record = finalized_record or latest_output_record or requested_record or max(self.repo.audit_records.values(), key=lambda item: item.id)
        output = latest_output if (finalized_record is None and latest_release_ready) else self.repo.outputs.get(record.institution_output_id or 0)
        snapshot = self.repo.snapshots.get(output.benchmark_snapshot_id) if output else self.repo.snapshots.get(record.benchmark_snapshot_id or 0)
        run = self.repo.runs.get(output.processing_run_id) if output else None
        release_status = str(run.notes_json.get("release_status", "draft")) if run else "draft"
        release_ready = bool(output and run and output.release_status in {"approved", "published"} and (run.run_status == "released" or release_status in {"approved", "published"}))
        finalized = record.record_status == "finalized"
        if finalized:
            lifecycle_message = "Canton-style audit record finalized."
        elif release_ready:
            lifecycle_message = "Institution output is released, but no finalized audit record exists yet."
        else:
            lifecycle_message = "Audit record not finalized yet."
        audit_trail = []
        if run and run.run_status != "not_started":
            audit_trail.extend(["Contribution package submitted", "Submission reviewed", "Benchmark run triggered", "Institution output generated"])
        if release_ready or finalized:
            audit_trail.append("Benchmark release approved")
        if finalized:
            audit_trail.append("Canton-style record finalized")
        if not audit_trail:
            audit_trail.append("Audit record not finalized yet")
        audit_context = {
            "requested_record_id": record_id,
            "record_id": record.id if finalized else None,
            "record_lifecycle": record.record_status if finalized else "not_finalized",
            "lifecycle_message": lifecycle_message,
            "canton_record_ref": record.canton_record_ref if finalized else None,
            "institution": self.repo.get_institution(output.institution_id).name if output else "Alpha Bank",
            "output_id": output.id if output and release_ready else None,
            "benchmark_snapshot_reference": f"Snapshot {snapshot.id}" if snapshot and release_ready else None,
            "run_id": run.id if run else None,
            "release_reference": f"Release run {run.id}" if run and release_ready else None,
            "attestation_reference": run.attestation_ref or self.repo.attestations[record.attestation_reference_id].ref_code if run else self.repo.attestations[record.attestation_reference_id].ref_code,
            "retention_status": "No raw payload retention",
            "raw_data_exposure": "None",
            "finalized_at": record.recorded_at.isoformat() if finalized and record.recorded_at else None,
            "release_ready": release_ready,
            "finalized": finalized,
        }
        return self.projections.audit_projection(
            record.id,
            [
                ActionDTO(title="Open Record Package", body="Inspect read-only audit record references and lifecycle evidence."),
                ActionDTO(title="View Benchmark Audit", body="Review benchmark release audit evidence."),
                ActionDTO(title="View Output Audit", body="Review institution-scoped derived output audit evidence."),
                ActionDTO(title="Back to Audit Overview", body="Return to auditor overview state."),
            ],
            audit_context=audit_context,
            audit_trail=audit_trail,
        )
