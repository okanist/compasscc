from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(240))
    party_name: Mapped[str] = mapped_column(String(240), index=True)
    institution_type: Mapped[str] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(240))
    scenario: Mapped[str] = mapped_column(String(240), index=True)
    status: Mapped[str] = mapped_column(String(80), index=True)
    min_reputation_threshold: Mapped[float] = mapped_column(Float)
    confidence_tier_required: Mapped[str] = mapped_column(String(80))
    tee_processing_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    requested_fields_json: Mapped[list[str]] = mapped_column(JSON)
    submission_window_start: Mapped[datetime] = mapped_column(DateTime)
    submission_window_end: Mapped[datetime] = mapped_column(DateTime)
    created_by: Mapped[str] = mapped_column(String(240))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ContributionSubmission(Base):
    __tablename__ = "contribution_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"), index=True)
    institution_id: Mapped[int] = mapped_column(ForeignKey("institutions.id"), index=True)
    submission_type: Mapped[str] = mapped_column(String(80))
    confidence_tier: Mapped[str] = mapped_column(String(80))
    payload_json: Mapped[dict] = mapped_column(JSON)
    policy_status: Mapped[str] = mapped_column(String(80), index=True)
    review_status: Mapped[str] = mapped_column(String(80), index=True)
    attestation_status: Mapped[str] = mapped_column(String(80), index=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ProcessingRun(Base):
    __tablename__ = "processing_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"), index=True)
    run_status: Mapped[str] = mapped_column(String(80), index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    attestation_ref: Mapped[str | None] = mapped_column(String(180), nullable=True)
    retention_policy_status: Mapped[str] = mapped_column(String(80))
    runtime_mode: Mapped[str] = mapped_column(String(80))
    input_count: Mapped[int] = mapped_column(Integer)
    valid_submission_count: Mapped[int] = mapped_column(Integer)
    invalid_submission_count: Mapped[int] = mapped_column(Integer)
    notes_json: Mapped[dict] = mapped_column(JSON)


class BenchmarkSnapshot(Base):
    __tablename__ = "benchmark_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    processing_run_id: Mapped[int] = mapped_column(ForeignKey("processing_runs.id"), index=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"), index=True)
    scenario: Mapped[str] = mapped_column(String(240), index=True)
    contributor_count: Mapped[int] = mapped_column(Integer)
    attested_coverage: Mapped[float] = mapped_column(Float)
    average_liquidity: Mapped[float] = mapped_column(Float)
    average_repo_rate: Mapped[float] = mapped_column(Float)
    average_haircut: Mapped[float] = mapped_column(Float)
    aggregate_notional: Mapped[float] = mapped_column(Float)
    benchmark_score: Mapped[float] = mapped_column(Float)
    dispersion: Mapped[float] = mapped_column(Float)
    reliability_score: Mapped[float] = mapped_column(Float)
    secondary_metrics_json: Mapped[dict] = mapped_column(JSON)
    alerts_json: Mapped[list[str]] = mapped_column(JSON)
    distribution_json: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class InstitutionOutput(Base):
    __tablename__ = "institution_outputs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    processing_run_id: Mapped[int] = mapped_column(ForeignKey("processing_runs.id"), index=True)
    institution_id: Mapped[int] = mapped_column(ForeignKey("institutions.id"), index=True)
    benchmark_snapshot_id: Mapped[int] = mapped_column(ForeignKey("benchmark_snapshots.id"), index=True)
    my_liquidity_score: Mapped[float] = mapped_column(Float)
    network_average: Mapped[float] = mapped_column(Float)
    delta_vs_benchmark: Mapped[float] = mapped_column(Float)
    risk_tier: Mapped[str] = mapped_column(String(80))
    confidence_level: Mapped[str] = mapped_column(String(80))
    collateral_structure: Mapped[str] = mapped_column(String(180))
    maturity_bucket: Mapped[str] = mapped_column(String(80))
    suggested_interpretation: Mapped[str] = mapped_column(Text)
    explainable_summary: Mapped[str] = mapped_column(Text)
    recommended_actions_json: Mapped[list[dict]] = mapped_column(JSON)
    release_status: Mapped[str] = mapped_column(String(80), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AttestationReference(Base):
    __tablename__ = "attestation_references"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    processing_run_id: Mapped[int] = mapped_column(ForeignKey("processing_runs.id"), index=True)
    ref_code: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    attestation_type: Mapped[str] = mapped_column(String(80))
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    issuer: Mapped[str] = mapped_column(String(180))
    metadata_json: Mapped[dict] = mapped_column(JSON)


class AuditRecord(Base):
    __tablename__ = "audit_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_output_id: Mapped[int | None] = mapped_column(ForeignKey("institution_outputs.id"), nullable=True)
    benchmark_snapshot_id: Mapped[int | None] = mapped_column(ForeignKey("benchmark_snapshots.id"), nullable=True)
    attestation_reference_id: Mapped[int] = mapped_column(ForeignKey("attestation_references.id"))
    record_status: Mapped[str] = mapped_column(String(80), index=True)
    canton_record_ref: Mapped[str | None] = mapped_column(String(240), nullable=True)
    release_scope_json: Mapped[dict] = mapped_column(JSON)
    recorded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[str] = mapped_column(String(240))
