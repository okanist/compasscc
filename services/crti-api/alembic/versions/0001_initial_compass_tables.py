"""initial compass tables

Revision ID: 0001_initial_compass_tables
Revises:
Create Date: 2026-04-26
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial_compass_tables"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "institutions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=240), nullable=False),
        sa.Column("party_name", sa.String(length=240), nullable=False),
        sa.Column("institution_type", sa.String(length=80), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_institutions_slug", "institutions", ["slug"], unique=True)
    op.create_index("ix_institutions_party_name", "institutions", ["party_name"])

    op.create_table(
        "campaigns",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("scenario", sa.String(length=240), nullable=False),
        sa.Column("status", sa.String(length=80), nullable=False),
        sa.Column("min_reputation_threshold", sa.Float(), nullable=False),
        sa.Column("confidence_tier_required", sa.String(length=80), nullable=False),
        sa.Column("tee_processing_enabled", sa.Boolean(), nullable=False),
        sa.Column("requested_fields_json", sa.JSON(), nullable=False),
        sa.Column("submission_window_start", sa.DateTime(), nullable=False),
        sa.Column("submission_window_end", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.String(length=240), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_campaigns_slug", "campaigns", ["slug"], unique=True)
    op.create_index("ix_campaigns_scenario", "campaigns", ["scenario"])
    op.create_index("ix_campaigns_status", "campaigns", ["status"])

    op.create_table(
        "contribution_submissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("institution_id", sa.Integer(), sa.ForeignKey("institutions.id"), nullable=False),
        sa.Column("submission_type", sa.String(length=80), nullable=False),
        sa.Column("confidence_tier", sa.String(length=80), nullable=False),
        sa.Column("payload_json", sa.JSON(), nullable=False),
        sa.Column("policy_status", sa.String(length=80), nullable=False),
        sa.Column("review_status", sa.String(length=80), nullable=False),
        sa.Column("attestation_status", sa.String(length=80), nullable=False),
        sa.Column("submitted_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_contribution_submissions_campaign_id", "contribution_submissions", ["campaign_id"])
    op.create_index("ix_contribution_submissions_institution_id", "contribution_submissions", ["institution_id"])

    op.create_table(
        "processing_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("run_status", sa.String(length=80), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("attestation_ref", sa.String(length=180), nullable=True),
        sa.Column("retention_policy_status", sa.String(length=80), nullable=False),
        sa.Column("runtime_mode", sa.String(length=80), nullable=False),
        sa.Column("input_count", sa.Integer(), nullable=False),
        sa.Column("valid_submission_count", sa.Integer(), nullable=False),
        sa.Column("invalid_submission_count", sa.Integer(), nullable=False),
        sa.Column("notes_json", sa.JSON(), nullable=False),
    )
    op.create_index("ix_processing_runs_campaign_id", "processing_runs", ["campaign_id"])

    op.create_table(
        "benchmark_snapshots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("processing_run_id", sa.Integer(), sa.ForeignKey("processing_runs.id"), nullable=False),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("scenario", sa.String(length=240), nullable=False),
        sa.Column("contributor_count", sa.Integer(), nullable=False),
        sa.Column("attested_coverage", sa.Float(), nullable=False),
        sa.Column("average_liquidity", sa.Float(), nullable=False),
        sa.Column("average_repo_rate", sa.Float(), nullable=False),
        sa.Column("average_haircut", sa.Float(), nullable=False),
        sa.Column("aggregate_notional", sa.Float(), nullable=False),
        sa.Column("benchmark_score", sa.Float(), nullable=False),
        sa.Column("dispersion", sa.Float(), nullable=False),
        sa.Column("reliability_score", sa.Float(), nullable=False),
        sa.Column("secondary_metrics_json", sa.JSON(), nullable=False),
        sa.Column("alerts_json", sa.JSON(), nullable=False),
        sa.Column("distribution_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_benchmark_snapshots_processing_run_id", "benchmark_snapshots", ["processing_run_id"])
    op.create_index("ix_benchmark_snapshots_campaign_id", "benchmark_snapshots", ["campaign_id"])

    op.create_table(
        "institution_outputs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("processing_run_id", sa.Integer(), sa.ForeignKey("processing_runs.id"), nullable=False),
        sa.Column("institution_id", sa.Integer(), sa.ForeignKey("institutions.id"), nullable=False),
        sa.Column("benchmark_snapshot_id", sa.Integer(), sa.ForeignKey("benchmark_snapshots.id"), nullable=False),
        sa.Column("my_liquidity_score", sa.Float(), nullable=False),
        sa.Column("network_average", sa.Float(), nullable=False),
        sa.Column("delta_vs_benchmark", sa.Float(), nullable=False),
        sa.Column("risk_tier", sa.String(length=80), nullable=False),
        sa.Column("confidence_level", sa.String(length=80), nullable=False),
        sa.Column("collateral_structure", sa.String(length=180), nullable=False),
        sa.Column("maturity_bucket", sa.String(length=80), nullable=False),
        sa.Column("suggested_interpretation", sa.Text(), nullable=False),
        sa.Column("explainable_summary", sa.Text(), nullable=False),
        sa.Column("recommended_actions_json", sa.JSON(), nullable=False),
        sa.Column("release_status", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_institution_outputs_processing_run_id", "institution_outputs", ["processing_run_id"])
    op.create_index("ix_institution_outputs_institution_id", "institution_outputs", ["institution_id"])

    op.create_table(
        "attestation_references",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("processing_run_id", sa.Integer(), sa.ForeignKey("processing_runs.id"), nullable=False),
        sa.Column("ref_code", sa.String(length=180), nullable=False),
        sa.Column("attestation_type", sa.String(length=80), nullable=False),
        sa.Column("issued_at", sa.DateTime(), nullable=False),
        sa.Column("issuer", sa.String(length=180), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
    )
    op.create_index("ix_attestation_references_ref_code", "attestation_references", ["ref_code"], unique=True)

    op.create_table(
        "audit_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("institution_output_id", sa.Integer(), sa.ForeignKey("institution_outputs.id"), nullable=True),
        sa.Column("benchmark_snapshot_id", sa.Integer(), sa.ForeignKey("benchmark_snapshots.id"), nullable=True),
        sa.Column("attestation_reference_id", sa.Integer(), sa.ForeignKey("attestation_references.id"), nullable=False),
        sa.Column("record_status", sa.String(length=80), nullable=False),
        sa.Column("canton_record_ref", sa.String(length=240), nullable=True),
        sa.Column("release_scope_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(), nullable=True),
        sa.Column("created_by", sa.String(length=240), nullable=False),
    )
    op.create_index("ix_audit_records_record_status", "audit_records", ["record_status"])


def downgrade() -> None:
    op.drop_table("audit_records")
    op.drop_table("attestation_references")
    op.drop_table("institution_outputs")
    op.drop_table("benchmark_snapshots")
    op.drop_table("processing_runs")
    op.drop_table("contribution_submissions")
    op.drop_table("campaigns")
    op.drop_table("institutions")
