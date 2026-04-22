from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


AppRole = Literal["institution_desk", "operator", "auditor"]


class MetricDTO(BaseModel):
    label: str
    value: str
    detail: str | None = None
    tone: str | None = None


class ActionDTO(BaseModel):
    title: str
    body: str


class InstitutionDTO(BaseModel):
    id: int
    slug: str
    name: str
    party_name: str
    institution_type: str
    is_active: bool
    created_at: datetime


class CampaignDTO(BaseModel):
    id: int
    slug: str
    title: str
    scenario: str
    status: str
    min_reputation_threshold: float
    confidence_tier_required: str
    tee_processing_enabled: bool
    requested_fields_json: list[str]
    submission_window_start: datetime
    submission_window_end: datetime
    created_by: str
    created_at: datetime


class ContributionSubmissionDTO(BaseModel):
    id: int
    campaign_id: int
    institution_id: int
    submission_type: str
    confidence_tier: str
    payload_json: dict[str, Any]
    policy_status: str
    review_status: str
    attestation_status: str
    submitted_at: datetime
    updated_at: datetime


class ProcessingRunDTO(BaseModel):
    id: int
    campaign_id: int
    run_status: str
    started_at: datetime | None
    finished_at: datetime | None
    attestation_ref: str | None
    retention_policy_status: str
    runtime_mode: str
    input_count: int
    valid_submission_count: int
    invalid_submission_count: int
    notes_json: dict[str, Any]


class BenchmarkSnapshotDTO(BaseModel):
    id: int
    processing_run_id: int
    campaign_id: int
    scenario: str
    contributor_count: int
    attested_coverage: float
    average_liquidity: float
    average_repo_rate: float
    average_haircut: float
    aggregate_notional: float
    benchmark_score: float
    dispersion: float
    reliability_score: float
    secondary_metrics_json: dict[str, Any]
    alerts_json: list[str]
    distribution_json: dict[str, Any]
    created_at: datetime


class InstitutionOutputDTO(BaseModel):
    id: int
    processing_run_id: int
    institution_id: int
    benchmark_snapshot_id: int
    my_liquidity_score: float
    network_average: float
    delta_vs_benchmark: float
    risk_tier: str
    confidence_level: str
    collateral_structure: str
    maturity_bucket: str
    suggested_interpretation: str
    explainable_summary: str
    recommended_actions_json: list[dict[str, Any]]
    release_status: str
    created_at: datetime


class AttestationReferenceDTO(BaseModel):
    id: int
    processing_run_id: int
    ref_code: str
    attestation_type: str
    issued_at: datetime
    issuer: str
    metadata_json: dict[str, Any]


class AuditRecordDTO(BaseModel):
    id: int
    institution_output_id: int | None
    benchmark_snapshot_id: int | None
    attestation_reference_id: int
    record_status: str
    canton_record_ref: str | None
    release_scope_json: dict[str, Any]
    recorded_at: datetime | None
    created_by: str


class OverviewProjection(BaseModel):
    role: AppRole
    metrics: list[MetricDTO]
    summaries: list[str]
    actions: list[ActionDTO]


class CampaignProjection(BaseModel):
    campaign: CampaignDTO
    metrics: list[MetricDTO]
    requested_fields: list[str]
    policy_summary: str
    actions: list[ActionDTO]
    submissions: list[ContributionSubmissionDTO] = Field(default_factory=list)


class ProcessingProjection(BaseModel):
    run: ProcessingRunDTO
    metrics: list[MetricDTO]
    lifecycle: list[str]
    evidence_refs: list[str]
    actions: list[ActionDTO]


class BenchmarkProjection(BaseModel):
    snapshot: BenchmarkSnapshotDTO
    primary_metrics: list[MetricDTO]
    secondary_metrics: list[MetricDTO]
    alerts: list[str]
    distribution: dict[str, Any]
    actions: list[ActionDTO]


class InstitutionOutputProjection(BaseModel):
    output: InstitutionOutputDTO
    metrics: list[MetricDTO]
    interpretation: str
    explainable_summary: str
    recommended_actions: list[dict[str, Any]]
    audit_handoff: list[str]
    actions: list[ActionDTO]


class AuditProjection(BaseModel):
    record: AuditRecordDTO
    attestation: AttestationReferenceDTO
    release_scope: dict[str, Any]
    evidence_refs: list[str]
    actions: list[ActionDTO]


class ContributionSubmitRequest(BaseModel):
    submission_type: str
    confidence_tier: str
    payload: dict[str, Any]
    attestation_status: str = "pending"


class ReviewSubmissionRequest(BaseModel):
    review_status: Literal["approved", "rejected", "needs_review"]
    policy_status: str | None = None
    notes: str | None = None


class CommandResult(BaseModel):
    status: str
    message: str
    resource_id: int | None = None
    next_state: str | None = None
