from copy import deepcopy
from datetime import datetime, timedelta
from typing import Any, Protocol

from .lifecycle import (
    RECORD_DRAFT,
    RECORD_FINALIZED,
    RELEASE_APPROVED,
    RELEASE_DRAFT,
    RELEASE_PUBLISHED,
    RUN_ACTIVE_STATES,
    RUN_COMPLETED,
    RUN_RELEASED,
    SUBMISSION_APPROVED,
    SUBMISSION_NEEDS_ATTESTATION,
    SUBMISSION_REJECTED,
    SUBMISSION_SUBMITTED,
)
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


class CompassRepositoryInterface(Protocol):
    def reset(self) -> None: ...
    def get_campaign(self, campaign_id: int = 1) -> CampaignDTO: ...
    def get_run(self, run_id: int = 1) -> ProcessingRunDTO: ...
    def list_submissions(self, campaign_id: int | None = None, review_status: str | None = None) -> list[ContributionSubmissionDTO]: ...


class CompassRepository:
    """Read/write boundary for Compass services.

    This in-memory implementation is seed-backed for development. Replace this
    with SQLAlchemy repositories when persistent storage is introduced.
    TODO: subscribe to Canton/Daml events and upsert authoritative workflow state.
    """

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
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
            ),
            2: InstitutionDTO(
                id=2,
                slug="meridian-treasury",
                name="Meridian Treasury",
                party_name="MeridianTreasury::Canton",
                institution_type="treasury",
                is_active=True,
                created_at=now - timedelta(days=84),
            ),
            3: InstitutionDTO(
                id=3,
                slug="northline-desk",
                name="Northline Desk",
                party_name="NorthlineDesk::Canton",
                institution_type="dealer",
                is_active=True,
                created_at=now - timedelta(days=78),
            ),
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
                review_status="submitted",
                attestation_status="system_signed",
                submitted_at=now - timedelta(days=1),
                updated_at=now - timedelta(hours=3),
            ),
            2: ContributionSubmissionDTO(
                id=2,
                campaign_id=1,
                institution_id=2,
                submission_type="Oracle / custodian-attested",
                confidence_tier="High",
                payload_json={
                    "liquidity_score": 76.4,
                    "repo_rate": 4.78,
                    "haircut": 2.6,
                    "notional": 188_000_000,
                    "collateral_structure": "Balanced UST and agency collateral",
                    "maturity_bucket": "4-7 days",
                },
                policy_status="matched",
                review_status="approved",
                attestation_status="attested",
                submitted_at=now - timedelta(days=2),
                updated_at=now - timedelta(hours=5),
            ),
            3: ContributionSubmissionDTO(
                id=3,
                campaign_id=1,
                institution_id=3,
                submission_type="Self-reported",
                confidence_tier="Medium",
                payload_json={
                    "liquidity_score": 72.9,
                    "repo_rate": 4.86,
                    "haircut": 3.0,
                    "notional": 121_000_000,
                    "collateral_structure": "Treasury-led collateral mix",
                    "maturity_bucket": "8-14 days",
                },
                policy_status="matched",
                review_status="under_review",
                attestation_status="needs_attestation",
                submitted_at=now - timedelta(days=1, hours=8),
                updated_at=now - timedelta(hours=4),
            ),
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
                input_count=3,
                valid_submission_count=3,
                invalid_submission_count=0,
                notes_json={"retry_markers": 1, "release_readiness": RELEASE_APPROVED, "release_status": RELEASE_APPROVED},
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
                release_status=RELEASE_APPROVED,
                created_at=now - timedelta(hours=1, minutes=30),
            ),
            2: InstitutionOutputDTO(
                id=2,
                processing_run_id=1,
                institution_id=2,
                benchmark_snapshot_id=1,
                my_liquidity_score=76.4,
                network_average=73.8,
                delta_vs_benchmark=+2.6,
                risk_tier="Outperforming",
                confidence_level="High",
                collateral_structure="Balanced UST and agency collateral",
                maturity_bucket="4-7 days",
                suggested_interpretation="Meridian Treasury is ahead of the active cohort on liquidity efficiency with strong collateral diversification.",
                explainable_summary="Deterministic analytics place Meridian Treasury above the network benchmark due to stronger liquidity and shorter maturity exposure.",
                recommended_actions_json=[
                    {"title": "Maintain funding mix", "body": "Current collateral diversification supports benchmark resilience."},
                    {"title": "Monitor rate sensitivity", "body": "Keep repo rate movement within cohort variance."},
                    {"title": "Record benchmark comparison", "body": "Prepare audit-linked Canton recording."},
                ],
                release_status=RELEASE_APPROVED,
                created_at=now - timedelta(hours=1, minutes=29),
            ),
            3: InstitutionOutputDTO(
                id=3,
                processing_run_id=1,
                institution_id=3,
                benchmark_snapshot_id=1,
                my_liquidity_score=72.9,
                network_average=73.8,
                delta_vs_benchmark=-0.9,
                risk_tier="Stable",
                confidence_level="Medium",
                collateral_structure="Treasury-led collateral mix",
                maturity_bucket="8-14 days",
                suggested_interpretation="Northline Desk is close to the active cohort benchmark and should improve assurance before relying on final scoring.",
                explainable_summary="Deterministic analytics place Northline Desk near the network benchmark, with confidence limited by current attestation status.",
                recommended_actions_json=[
                    {"title": "Add attestation", "body": "Upgrade the submission assurance class for stronger benchmark treatment."},
                    {"title": "Review tenor exposure", "body": "Compare 8-14 day maturities against the active cohort."},
                    {"title": "Record benchmark comparison", "body": "Prepare audit-linked Canton recording."},
                ],
                release_status=RELEASE_APPROVED,
                created_at=now - timedelta(hours=1, minutes=28),
            ),
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
                record_status=RECORD_DRAFT,
                canton_record_ref=None,
                release_scope_json={
                    "included": ["benchmark_delta", "risk_tier", "interpretation_summary"],
                    "excluded": ["raw_peer_contributions", "raw_institution_payload"],
                },
                created_at=now - timedelta(hours=1, minutes=25),
                recorded_at=None,
                created_by="institution_desk",
            )
        }

    def get_institution(self, institution_id: int = 1) -> InstitutionDTO:
        return self.institutions[institution_id]

    def get_campaign(self, campaign_id: int = 1) -> CampaignDTO:
        return self.campaigns[campaign_id]

    def get_active_campaign(self) -> CampaignDTO | None:
        return next((item for item in self.campaigns.values() if item.status == "active"), None)

    def get_run(self, run_id: int = 1) -> ProcessingRunDTO:
        return self.runs[run_id]

    def get_latest_run_for_campaign(self, campaign_id: int = 1) -> ProcessingRunDTO:
        return max((item for item in self.runs.values() if item.campaign_id == campaign_id), key=lambda item: item.id)

    def get_active_run_for_campaign(self, campaign_id: int) -> ProcessingRunDTO | None:
        return next((item for item in self.runs.values() if item.campaign_id == campaign_id and item.run_status in RUN_ACTIVE_STATES), None)

    def get_latest_snapshot_for_campaign(self, campaign_id: int) -> BenchmarkSnapshotDTO:
        return max((item for item in self.snapshots.values() if item.campaign_id == campaign_id), key=lambda item: item.id)

    def get_snapshot(self, snapshot_id: int | None = None) -> BenchmarkSnapshotDTO:
        if snapshot_id is None:
            return max(self.snapshots.values(), key=lambda item: item.id)
        return self.snapshots[snapshot_id]

    def get_snapshot_by_scenario(self, scenario: str | None = None) -> BenchmarkSnapshotDTO:
        if not scenario:
            return max(self.snapshots.values(), key=lambda item: item.id)
        matches = [item for item in self.snapshots.values() if item.scenario == scenario]
        return max(matches, key=lambda item: item.id) if matches else max(self.snapshots.values(), key=lambda item: item.id)

    def get_output(self, output_id: int = 1) -> InstitutionOutputDTO:
        return self.outputs[output_id]

    def get_output_for_institution(self, institution_id: int = 1, snapshot_id: int | None = None) -> InstitutionOutputDTO:
        matching_outputs = [
            item
            for item in self.outputs.values()
            if item.institution_id == institution_id and (snapshot_id is None or item.benchmark_snapshot_id == snapshot_id)
        ]
        if matching_outputs:
            return max(matching_outputs, key=lambda item: item.id)
        return max(
            (item for item in self.outputs.values() if item.institution_id == institution_id),
            key=lambda item: item.benchmark_snapshot_id,
        )

    def get_audit_record_for_output(self, output_id: int) -> AuditRecordDTO | None:
        return next((item for item in self.audit_records.values() if item.institution_output_id == output_id), None)

    def list_pending_operator_submissions(self) -> list[ContributionSubmissionDTO]:
        return [
            item
            for item in self.submissions.values()
            if item.review_status in {"submitted", "under_review", "needs_attestation"}
        ]

    def get_attestation_for_run(self, run_id: int = 1) -> AttestationReferenceDTO:
        return next(item for item in self.attestations.values() if item.processing_run_id == run_id)

    def get_audit_record(self, record_id: int = 1) -> AuditRecordDTO:
        return self.audit_records[record_id]

    def get_submission(self, submission_id: int) -> ContributionSubmissionDTO:
        return self.submissions[submission_id]

    def get_latest_submission_for_institution(self, campaign_id: int, institution_id: int) -> ContributionSubmissionDTO | None:
        matches = [
            item
            for item in self.submissions.values()
            if item.campaign_id == campaign_id and item.institution_id == institution_id
        ]
        return max(matches, key=lambda item: item.id) if matches else None

    def _normalized_submission_payload(
        self,
        *,
        institution_id: int,
        incoming_payload: dict[str, Any],
        latest: ContributionSubmissionDTO | None,
    ) -> dict[str, Any]:
        if "liquidity_score" in incoming_payload:
            return incoming_payload
        if latest and "liquidity_score" in latest.payload_json:
            return {**latest.payload_json, "submitted_fields": incoming_payload}
        demo_defaults = {
            1: {
                "liquidity_score": 69.1,
                "repo_rate": 4.92,
                "haircut": 3.1,
                "notional": 142_000_000,
                "collateral_structure": "UST-heavy with concentrated tenor",
                "maturity_bucket": "8-14 days",
            },
            2: {
                "liquidity_score": 76.4,
                "repo_rate": 4.78,
                "haircut": 2.6,
                "notional": 188_000_000,
                "collateral_structure": "Balanced UST and agency collateral",
                "maturity_bucket": "4-7 days",
            },
            3: {
                "liquidity_score": 72.9,
                "repo_rate": 4.86,
                "haircut": 3.0,
                "notional": 121_000_000,
                "collateral_structure": "Treasury-led collateral mix",
                "maturity_bucket": "8-14 days",
            },
        }
        return {**demo_defaults.get(institution_id, demo_defaults[1]), "submitted_fields": incoming_payload}

    def list_submissions(self, campaign_id: int | None = None, review_status: str | None = None) -> list[ContributionSubmissionDTO]:
        submissions = list(self.submissions.values())
        if campaign_id is not None:
            submissions = [item for item in submissions if item.campaign_id == campaign_id]
        if review_status is not None:
            submissions = [item for item in submissions if item.review_status == review_status]
        return submissions

    def create_or_update_submission(self, campaign_id: int, institution_id: int, payload: dict[str, Any]) -> tuple[ContributionSubmissionDTO, bool]:
        latest = self.get_latest_submission_for_institution(campaign_id, institution_id)
        now = datetime.utcnow()
        normalized_payload = self._normalized_submission_payload(
            institution_id=institution_id,
            incoming_payload=payload["payload"],
            latest=latest,
        )
        if latest and latest.review_status in {SUBMISSION_SUBMITTED, "under_review", SUBMISSION_NEEDS_ATTESTATION}:
            updated = latest.model_copy(
                update={
                    "submission_type": payload["submission_type"],
                    "confidence_tier": payload["confidence_tier"],
                    "payload_json": normalized_payload,
                    "policy_status": SUBMISSION_SUBMITTED,
                    "review_status": SUBMISSION_SUBMITTED,
                    "attestation_status": payload.get("attestation_status", "pending"),
                    "updated_at": now,
                }
            )
            self.submissions[latest.id] = updated
            return updated, False

        new_id = max(self.submissions, default=0) + 1
        submission = ContributionSubmissionDTO(
            id=new_id,
            campaign_id=campaign_id,
            institution_id=institution_id,
            submission_type=payload["submission_type"],
            confidence_tier=payload["confidence_tier"],
            payload_json=normalized_payload,
            policy_status=SUBMISSION_SUBMITTED,
            review_status=SUBMISSION_SUBMITTED,
            attestation_status=payload.get("attestation_status", "pending"),
            submitted_at=now,
            updated_at=now,
        )
        self.submissions[new_id] = submission
        return submission, True

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

    def create_processing_run(self, campaign_id: int, status: str = "running") -> ProcessingRunDTO:
        campaign_submissions = self.list_submissions(campaign_id=campaign_id)
        valid = [item for item in campaign_submissions if item.review_status == SUBMISSION_APPROVED]
        invalid = [item for item in campaign_submissions if item.review_status in {SUBMISSION_REJECTED, SUBMISSION_NEEDS_ATTESTATION}]
        new_id = max(self.runs, default=0) + 1
        now = datetime.utcnow()
        run = ProcessingRunDTO(
            id=new_id,
            campaign_id=campaign_id,
            run_status=status,
            started_at=now,
            finished_at=now if status in {"completed", "release_pending", "released"} else None,
            attestation_ref=f"TEE-ATTEST-Q2-REPONET-{new_id:03d}",
            retention_policy_status="raw_retention_disabled",
            runtime_mode="tee_deterministic",
            input_count=len(campaign_submissions),
            valid_submission_count=len(valid),
            invalid_submission_count=len(invalid),
            notes_json={"retry_markers": 0, "release_readiness": RELEASE_DRAFT, "release_status": RELEASE_DRAFT},
        )
        self.runs[new_id] = run
        attestation_id = max(self.attestations, default=0) + 1
        self.attestations[attestation_id] = AttestationReferenceDTO(
            id=attestation_id,
            processing_run_id=run.id,
            ref_code=run.attestation_ref or f"TEE-ATTEST-Q2-REPONET-{new_id:03d}",
            attestation_type="tee_runtime",
            issued_at=now,
            issuer="Compass Runtime",
            metadata_json={"runtime": run.runtime_mode, "retention": "none"},
        )
        return run

    def update_run_status(self, run_id: int, status: str, release_status: str | None = None) -> ProcessingRunDTO:
        current = self.runs[run_id]
        notes = {**current.notes_json}
        if release_status:
            notes["release_status"] = release_status
            notes["release_readiness"] = release_status
        updated = current.model_copy(
            update={
                "run_status": status,
                "finished_at": datetime.utcnow() if status in {RUN_COMPLETED, "release_pending", RUN_RELEASED} else current.finished_at,
                "notes_json": notes,
            }
        )
        self.runs[run_id] = updated
        return updated

    def update_outputs_release_status_for_run(self, run_id: int, release_status: str) -> None:
        for output_id, output in list(self.outputs.items()):
            if output.processing_run_id == run_id:
                self.outputs[output_id] = output.model_copy(update={"release_status": release_status})

    def create_or_update_output_for_submission(
        self,
        *,
        processing_run_id: int,
        snapshot: BenchmarkSnapshotDTO,
        submission: ContributionSubmissionDTO,
        comparison: dict[str, str | float],
        interpretation: str,
    ) -> InstitutionOutputDTO:
        current = next(
            (
                item
                for item in self.outputs.values()
                if item.institution_id == submission.institution_id and item.benchmark_snapshot_id == snapshot.id
            ),
            None,
        )
        payload = submission.payload_json
        update = {
            "processing_run_id": processing_run_id,
            "institution_id": submission.institution_id,
            "benchmark_snapshot_id": snapshot.id,
            "my_liquidity_score": float(payload.get("liquidity_score", 0)),
            "network_average": snapshot.average_liquidity,
            "delta_vs_benchmark": float(comparison["delta_vs_benchmark"]),
            "risk_tier": str(comparison["risk_tier"]),
            "confidence_level": str(comparison["confidence_level"]),
            "collateral_structure": str(payload.get("collateral_structure", "Not provided")),
            "maturity_bucket": str(payload.get("maturity_bucket", "Not provided")),
            "suggested_interpretation": interpretation,
            "explainable_summary": interpretation,
            "recommended_actions_json": [
                {"title": "Review benchmark delta", "body": "Compare institution output against approved benchmark release."},
                {"title": "Record benchmark comparison", "body": "Finalize the institution-scoped audit record when ready."},
            ],
            "release_status": RELEASE_DRAFT,
            "created_at": datetime.utcnow(),
        }
        if current:
            updated = current.model_copy(update=update)
            self.outputs[current.id] = updated
            return updated
        new_id = max(self.outputs, default=0) + 1
        output = InstitutionOutputDTO(id=new_id, **update)
        self.outputs[new_id] = output
        return output

    def create_or_get_audit_record_for_output(self, output_id: int, created_by: str = "institution_desk") -> AuditRecordDTO:
        current = self.get_audit_record_for_output(output_id)
        if current:
            return current
        output = self.get_output(output_id)
        attestation = self.get_attestation_for_run(output.processing_run_id)
        new_id = max(self.audit_records, default=0) + 1
        record = AuditRecordDTO(
            id=new_id,
            institution_output_id=output.id,
            benchmark_snapshot_id=output.benchmark_snapshot_id,
            attestation_reference_id=attestation.id,
            record_status=RECORD_DRAFT,
            canton_record_ref=None,
            release_scope_json={
                "included": ["benchmark_delta", "risk_tier", "interpretation_summary"],
                "excluded": ["raw_peer_contributions", "raw_institution_payload", "desk_recommendation_blocks"],
            },
            created_at=datetime.utcnow(),
            recorded_at=None,
            created_by=created_by,
        )
        self.audit_records[new_id] = record
        return record

    def update_audit_record_status(self, record_id: int, status: str, canton_ref: str | None = None) -> AuditRecordDTO:
        current = self.audit_records[record_id]
        updated = current.model_copy(
            update={
                "record_status": status,
                "canton_record_ref": canton_ref,
                "recorded_at": datetime.utcnow() if status == RECORD_FINALIZED and current.recorded_at is None else current.recorded_at,
            }
        )
        self.audit_records[record_id] = updated
        return updated

    def clone(self) -> "CompassRepository":
        return deepcopy(self)


repository = CompassRepository()
