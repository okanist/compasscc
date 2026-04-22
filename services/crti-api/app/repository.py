from copy import deepcopy
from datetime import datetime, timedelta
from typing import Any

from .schemas import (
    AttestationReferenceDTO,
    AuditRecordDTO,
    BenchmarkSnapshotDTO,
    CampaignDTO,
    ContributionSubmissionDTO,
    InstitutionDTO,
    InstitutionOutputDTO,
    ProcessingRunDTO,
)


class CompassRepository:
    """Read/write boundary for Compass services.

    This in-memory implementation is seed-backed for development. Replace this
    with SQLAlchemy repositories when persistent storage is introduced.
    TODO: subscribe to Canton/Daml events and upsert authoritative workflow state.
    """

    def __init__(self) -> None:
        now = datetime.utcnow()
        self.institutions = {
            1: InstitutionDTO(
                id=1,
                slug="alpha-bank",
                name="Alpha Bank",
                party_name="AlphaBank::Canton",
                institution_type="bank",
                is_active=True,
                created_at=now - timedelta(days=90),
            )
        }
        self.campaigns = {
            1: CampaignDTO(
                id=1,
                slug="q2-repo-treasury",
                title="Q2 Repo Liquidity and Treasury Readiness Campaign",
                scenario="Repo with Treasury Collateral",
                status="active",
                min_reputation_threshold=0.78,
                confidence_tier_required="High",
                tee_processing_enabled=True,
                requested_fields_json=[
                    "repo notional range",
                    "secured funding rate",
                    "collateral concentration",
                    "average maturity bucket",
                    "liquidity buffer ratio",
                ],
                submission_window_start=now - timedelta(days=7),
                submission_window_end=now + timedelta(days=10),
                created_by="operator",
                created_at=now - timedelta(days=12),
            )
        }
        self.submissions = {
            1: ContributionSubmissionDTO(
                id=1,
                campaign_id=1,
                institution_id=1,
                submission_type="System-signed",
                confidence_tier="High",
                payload_json={
                    "liquidity_score": 69.1,
                    "repo_rate": 4.92,
                    "haircut": 3.1,
                    "notional": 142_000_000,
                    "collateral_structure": "UST-heavy with concentrated tenor",
                    "maturity_bucket": "8-14 days",
                },
                policy_status="matched",
                review_status="pending",
                attestation_status="system_signed",
                submitted_at=now - timedelta(days=1),
                updated_at=now - timedelta(hours=3),
            )
        }
        self.runs = {
            1: ProcessingRunDTO(
                id=1,
                campaign_id=1,
                run_status="completed",
                started_at=now - timedelta(hours=2),
                finished_at=now - timedelta(hours=1, minutes=40),
                attestation_ref="TEE-ATTEST-Q2-REPONET-014",
                retention_policy_status="raw_retention_disabled",
                runtime_mode="tee_deterministic",
                input_count=28,
                valid_submission_count=24,
                invalid_submission_count=4,
                notes_json={"retry_markers": 1, "release_readiness": "ready"},
            )
        }
        self.snapshots = {
            1: BenchmarkSnapshotDTO(
                id=1,
                processing_run_id=1,
                campaign_id=1,
                scenario="Repo with Treasury Collateral",
                contributor_count=24,
                attested_coverage=0.68,
                average_liquidity=73.8,
                average_repo_rate=4.84,
                average_haircut=2.9,
                aggregate_notional=1_420_000_000,
                benchmark_score=88.6,
                dispersion=12.4,
                reliability_score=91.4,
                secondary_metrics_json={
                    "Average Maturity": "11.2 days",
                    "Treasury Yield Context": "4.37% UST proxy",
                    "Duration Proxy": "0.19",
                    "Yield Dispersion": "41 bps",
                },
                alerts_json=["LIQUIDITY_OK", "ELEVATED_DISPERSION", "HAIRCUT_STRESS_SIGNAL"],
                distribution_json={"top_quartile": 81.2, "median": 73.8, "bottom_quartile": 62.4},
                created_at=now - timedelta(hours=1, minutes=35),
            )
        }
        self.outputs = {
            1: InstitutionOutputDTO(
                id=1,
                processing_run_id=1,
                institution_id=1,
                benchmark_snapshot_id=1,
                my_liquidity_score=69.1,
                network_average=73.8,
                delta_vs_benchmark=-4.7,
                risk_tier="Contained Watch",
                confidence_level="High",
                collateral_structure="UST-heavy with concentrated tenor",
                maturity_bucket="8-14 days",
                suggested_interpretation=(
                    "The desk remains within acceptable network liquidity bounds, but funding "
                    "efficiency trails peers under mixed repo and treasury collateral conditions."
                ),
                explainable_summary=(
                    "Deterministic analytics place Alpha Bank modestly below the network benchmark "
                    "because liquidity coverage and collateral diversification are weaker than the "
                    "current trust-weighted cohort median."
                ),
                recommended_actions_json=[
                    {"title": "Review collateral concentration", "body": "Assess UST-heavy profiles against cohort behavior."},
                    {"title": "Assess maturity distribution", "body": "Review 8-14 day exposure under mixed repo settlement."},
                    {"title": "Record benchmark comparison", "body": "Prepare audit-linked Canton recording."},
                ],
                release_status="release_ready",
                created_at=now - timedelta(hours=1, minutes=30),
            )
        }
        self.attestations = {
            1: AttestationReferenceDTO(
                id=1,
                processing_run_id=1,
                ref_code="TEE-ATTEST-Q2-REPONET-014",
                attestation_type="tee_runtime",
                issued_at=now - timedelta(hours=1, minutes=38),
                issuer="Compass Runtime",
                metadata_json={"runtime": "tee_deterministic", "retention": "none"},
            )
        }
        self.audit_records = {
            1: AuditRecordDTO(
                id=1,
                institution_output_id=1,
                benchmark_snapshot_id=1,
                attestation_reference_id=1,
                record_status="draft",
                canton_record_ref=None,
                release_scope_json={
                    "included": ["benchmark_delta", "risk_tier", "interpretation_summary"],
                    "excluded": ["raw_peer_contributions", "raw_institution_payload"],
                },
                recorded_at=None,
                created_by="institution_desk",
            )
        }

    def get_institution(self, institution_id: int = 1) -> InstitutionDTO:
        return self.institutions[institution_id]

    def get_campaign(self, campaign_id: int = 1) -> CampaignDTO:
        return self.campaigns[campaign_id]

    def get_run(self, run_id: int = 1) -> ProcessingRunDTO:
        return self.runs[run_id]

    def get_snapshot(self, snapshot_id: int = 1) -> BenchmarkSnapshotDTO:
        return self.snapshots[snapshot_id]

    def get_snapshot_by_scenario(self, scenario: str | None = None) -> BenchmarkSnapshotDTO:
        if not scenario:
            return next(iter(self.snapshots.values()))
        return next((item for item in self.snapshots.values() if item.scenario == scenario), next(iter(self.snapshots.values())))

    def get_output(self, output_id: int = 1) -> InstitutionOutputDTO:
        return self.outputs[output_id]

    def get_output_for_institution(self, institution_id: int = 1, snapshot_id: int | None = None) -> InstitutionOutputDTO:
        return next(
            item
            for item in self.outputs.values()
            if item.institution_id == institution_id and (snapshot_id is None or item.benchmark_snapshot_id == snapshot_id)
        )

    def get_attestation_for_run(self, run_id: int = 1) -> AttestationReferenceDTO:
        return next(item for item in self.attestations.values() if item.processing_run_id == run_id)

    def get_audit_record(self, record_id: int = 1) -> AuditRecordDTO:
        return self.audit_records[record_id]

    def list_submissions(self, campaign_id: int | None = None, review_status: str | None = None) -> list[ContributionSubmissionDTO]:
        submissions = list(self.submissions.values())
        if campaign_id is not None:
            submissions = [item for item in submissions if item.campaign_id == campaign_id]
        if review_status is not None:
            submissions = [item for item in submissions if item.review_status == review_status]
        return submissions

    def create_submission(self, campaign_id: int, institution_id: int, payload: dict[str, Any]) -> ContributionSubmissionDTO:
        new_id = max(self.submissions) + 1
        now = datetime.utcnow()
        submission = ContributionSubmissionDTO(
            id=new_id,
            campaign_id=campaign_id,
            institution_id=institution_id,
            submission_type=payload["submission_type"],
            confidence_tier=payload["confidence_tier"],
            payload_json=payload["payload"],
            policy_status="submitted",
            review_status="pending",
            attestation_status=payload.get("attestation_status", "pending"),
            submitted_at=now,
            updated_at=now,
        )
        self.submissions[new_id] = submission
        return submission

    def update_submission_review(self, submission_id: int, review_status: str, policy_status: str | None = None) -> ContributionSubmissionDTO:
        current = self.submissions[submission_id]
        updated = current.model_copy(
            update={
                "review_status": review_status,
                "policy_status": policy_status or current.policy_status,
                "updated_at": datetime.utcnow(),
            }
        )
        self.submissions[submission_id] = updated
        return updated

    def update_audit_record_status(self, record_id: int, status: str, canton_ref: str | None = None) -> AuditRecordDTO:
        current = self.audit_records[record_id]
        updated = current.model_copy(
            update={
                "record_status": status,
                "canton_record_ref": canton_ref,
                "recorded_at": datetime.utcnow() if status == "final" else current.recorded_at,
            }
        )
        self.audit_records[record_id] = updated
        return updated

    def clone(self) -> "CompassRepository":
        return deepcopy(self)


repository = CompassRepository()
