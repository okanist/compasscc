from .audit_package import AuditPackageService
from ..repository import CompassRepository
from ..schemas import (
    ActionDTO,
    AuditProjection,
    BenchmarkProjection,
    CampaignProjection,
    InstitutionOutputProjection,
    MetricDTO,
    OverviewProjection,
    ProcessingProjection,
)


def pct(value: float) -> str:
    return f"{value * 100:.0f}%" if value <= 1 else f"{value:.1f}%"


def money(value: float) -> str:
    if value >= 1_000_000_000:
        return f"${value / 1_000_000_000:.2f}B"
    if value >= 1_000_000:
        return f"${value / 1_000_000:.1f}M"
    return f"${value:,.0f}"


class ProjectionFactory:
    def __init__(self, repo: CompassRepository, audit_package: AuditPackageService) -> None:
        self.repo = repo
        self.audit_package = audit_package

    def overview_projection(
        self,
        role,
        metrics: list[MetricDTO],
        summaries: list[str],
        actions: list[ActionDTO],
        overview_sections: dict | None = None,
    ) -> OverviewProjection:
        return OverviewProjection(
            role=role,
            metrics=metrics,
            summaries=summaries,
            actions=actions,
            overview_sections=overview_sections or {},
        )

    def campaign_projection(
        self,
        campaign_id: int,
        actions: list[ActionDTO],
        institution_id: int | None = None,
        contribution_package: dict | None = None,
        contribution_policy: dict | None = None,
    ) -> CampaignProjection:
        campaign = self.repo.get_campaign(campaign_id)
        submissions = self.repo.list_submissions(campaign_id=campaign_id)
        if institution_id is not None:
            submissions = [item for item in submissions if item.institution_id == institution_id]
        return CampaignProjection(
            campaign=campaign,
            metrics=[
                MetricDTO(label="Campaign Status", value=campaign.status),
                MetricDTO(label="Minimum Reputation", value=f"{campaign.min_reputation_threshold:.2f}"),
                MetricDTO(label="Confidence Required", value=campaign.confidence_tier_required),
                MetricDTO(label="Confidential Processing", value="Enabled" if campaign.tee_processing_enabled else "Disabled"),
            ],
            requested_fields=campaign.requested_fields_json,
            policy_summary=(
                "System-signed and custodian-attested submissions receive stronger benchmark treatment. "
                "Out-of-policy contributions remain review-only until resolved."
            ),
            submissions=submissions,
            actions=actions,
            contribution_package=contribution_package or {},
            contribution_policy=contribution_policy or {},
        )

    def processing_projection(
        self,
        run_id: int,
        actions: list[ActionDTO],
        processing_context: dict | None = None,
    ) -> ProcessingProjection:
        run = self.repo.get_run(run_id)
        if run.run_status == "not_started":
            return ProcessingProjection(
                run=run,
                metrics=[
                    MetricDTO(label="Run Status", value="Waiting for contribution"),
                    MetricDTO(label="Runtime Mode", value=run.runtime_mode),
                    MetricDTO(label="Input Count", value="0"),
                    MetricDTO(label="Valid Inputs", value="0"),
                    MetricDTO(label="Invalid Inputs", value="0"),
                    MetricDTO(label="Retention Policy", value=run.retention_policy_status),
                    MetricDTO(label="Attestation Ref", value="Pending"),
                    MetricDTO(label="Release Readiness", value="draft"),
                ],
                lifecycle=[
                    "waiting for institution contribution package",
                    "confidential processing not started",
                    "no raw contribution package received",
                    "derived outputs not generated",
                ],
                evidence_refs=[],
                actions=actions,
                processing_context=processing_context or {},
            )
        attestation = self.repo.get_attestation_for_run(run.id)
        return ProcessingProjection(
            run=run,
            metrics=[
                MetricDTO(label="Run Status", value=run.run_status),
                MetricDTO(label="Runtime Mode", value=run.runtime_mode),
                MetricDTO(label="Input Count", value=str(run.input_count)),
                MetricDTO(label="Valid Inputs", value=str(run.valid_submission_count)),
                MetricDTO(label="Invalid Inputs", value=str(run.invalid_submission_count)),
                MetricDTO(label="Retention Policy", value=run.retention_policy_status),
                MetricDTO(label="Attestation Ref", value=run.attestation_ref or "Pending"),
                MetricDTO(label="Release Readiness", value=str(run.notes_json.get("release_readiness", "draft"))),
            ],
            lifecycle=[
                "submission reviewed",
                "processing run triggered",
                "benchmark snapshot computed",
                "institution outputs generated",
                "attestation reference generated",
                "audit package prepared",
            ],
            evidence_refs=[attestation.ref_code, "runtime-manifest", "retention-checkpoint"],
            actions=actions,
            processing_context=processing_context or {},
        )

    def benchmark_projection(self, scenario: str | None, actions: list[ActionDTO]) -> BenchmarkProjection:
        snapshot = self.repo.get_snapshot_by_scenario(scenario)
        return BenchmarkProjection(
            snapshot=snapshot,
            primary_metrics=[
                MetricDTO(label="Average Liquidity", value=f"{snapshot.average_liquidity:.1f} / 100"),
                MetricDTO(label="Average Repo Rate", value=f"{snapshot.average_repo_rate:.2f}%"),
                MetricDTO(label="Average Haircut", value=f"{snapshot.average_haircut:.1f}%"),
                MetricDTO(label="Aggregate Notional", value=money(snapshot.aggregate_notional)),
                MetricDTO(label="Contributor Count", value=str(snapshot.contributor_count)),
                MetricDTO(label="Trust-Weighted Benchmark Score", value=f"{snapshot.benchmark_score:.1f}"),
                MetricDTO(label="Liquidity Dispersion", value=f"{snapshot.dispersion:.1f} pts"),
                MetricDTO(label="Benchmark Reliability", value=f"{snapshot.reliability_score:.1f}%"),
            ],
            secondary_metrics=[
                MetricDTO(label=label, value=str(value)) for label, value in snapshot.secondary_metrics_json.items()
            ],
            alerts=snapshot.alerts_json,
            distribution=snapshot.distribution_json,
            actions=actions,
        )

    def institution_output_projection(
        self,
        institution_id: int,
        scenario: str | None,
        actions: list[ActionDTO],
        include_recommendations: bool = True,
    ) -> InstitutionOutputProjection:
        snapshot = self.repo.get_snapshot_by_scenario(scenario)
        output = self.repo.get_output_for_institution(institution_id, snapshot.id)
        audit_record = self.repo.get_audit_record_for_output(output.id)
        record_status = audit_record.record_status if audit_record else "draft"
        return InstitutionOutputProjection(
            output=output,
            metrics=[
                MetricDTO(label="My Liquidity Score", value=f"{output.my_liquidity_score:.1f} / 100"),
                MetricDTO(label="Network Average", value=f"{output.network_average:.1f} / 100"),
                MetricDTO(label="Delta vs Benchmark", value=f"{output.delta_vs_benchmark:+.1f} pts"),
                MetricDTO(label="Risk Tier", value=output.risk_tier),
                MetricDTO(label="Confidence Level", value=output.confidence_level),
                MetricDTO(label="Collateral Structure", value=output.collateral_structure),
                MetricDTO(label="Maturity Bucket", value=output.maturity_bucket),
            ],
            interpretation=output.suggested_interpretation,
            explainable_summary=output.explainable_summary,
            recommended_actions=output.recommended_actions_json if include_recommendations else [],
            audit_handoff=[
                "Benchmark snapshot reference available",
                "Institution-scoped output package ready",
                "Attestation-linked summary available",
                f"Record lifecycle: {record_status}",
            ],
            audit_record=audit_record,
            actions=actions,
        )

    def audit_projection(self, record_id: int, actions: list[ActionDTO]) -> AuditProjection:
        record = self.repo.get_audit_record(record_id)
        attestation = self.repo.attestations[record.attestation_reference_id]
        package = self.audit_package.build_package(
            snapshot=self.repo.snapshots.get(record.benchmark_snapshot_id or 0),
            output=self.repo.outputs.get(record.institution_output_id or 0),
            attestation=attestation,
            record=record,
        )
        return AuditProjection(
            record=record,
            attestation=attestation,
            release_scope=package["release_scope"],
            evidence_refs=package["evidence_refs"],
            actions=actions,
        )
