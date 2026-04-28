from dataclasses import dataclass
from typing import Any, Protocol


@dataclass(frozen=True)
class LedgerCommandRef:
    command: str
    ref: str


class LedgerCommandAdapter(Protocol):
    def create_campaign(self, campaign_id: int) -> LedgerCommandRef: ...
    def submit_contribution(self, submission_id: int) -> LedgerCommandRef: ...
    def review_submission(self, submission_id: int, review_status: str) -> LedgerCommandRef: ...
    def create_processing_run(self, run_id: int) -> LedgerCommandRef: ...
    def mark_run_completed(self, run_id: int) -> LedgerCommandRef: ...
    def approve_release(self, run_id: int) -> LedgerCommandRef: ...
    def create_institution_output(self, output_id: int) -> LedgerCommandRef: ...
    def finalize_audit_record(self, record_id: int) -> LedgerCommandRef: ...


class NoopLedgerCommandAdapter:
    """Deterministic command adapter used until Canton command submission is wired.

    TODO: replace with Daml JSON API / Ledger API command submission.
    """

    def _ref(self, command: str, resource_id: int) -> LedgerCommandRef:
        return LedgerCommandRef(command=command, ref=f"NOOP-LEDGER-{command.upper()}-{resource_id:04d}")

    def create_campaign(self, campaign_id: int) -> LedgerCommandRef:
        return self._ref("create_campaign", campaign_id)

    def submit_contribution(self, submission_id: int) -> LedgerCommandRef:
        return self._ref("submit_contribution", submission_id)

    def review_submission(self, submission_id: int, review_status: str) -> LedgerCommandRef:
        return LedgerCommandRef(
            command="review_submission",
            ref=f"NOOP-LEDGER-REVIEW-SUBMISSION-{submission_id:04d}-{review_status.upper()}",
        )

    def create_processing_run(self, run_id: int) -> LedgerCommandRef:
        return self._ref("create_processing_run", run_id)

    def mark_run_completed(self, run_id: int) -> LedgerCommandRef:
        return self._ref("mark_run_completed", run_id)

    def approve_release(self, run_id: int) -> LedgerCommandRef:
        return self._ref("approve_release", run_id)

    def create_institution_output(self, output_id: int) -> LedgerCommandRef:
        return self._ref("create_institution_output", output_id)

    def finalize_audit_record(self, record_id: int) -> LedgerCommandRef:
        return LedgerCommandRef(command="finalize_audit_record", ref=f"CANTON-REC-{record_id:04d}")


class LedgerEventIngestor(Protocol):
    def ingest_campaign_created(self, event: dict[str, Any]) -> None: ...
    def ingest_contribution_submission_created(self, event: dict[str, Any]) -> None: ...
    def ingest_submission_reviewed(self, event: dict[str, Any]) -> None: ...
    def ingest_processing_run_updated(self, event: dict[str, Any]) -> None: ...
    def ingest_benchmark_release_published(self, event: dict[str, Any]) -> None: ...
    def ingest_institution_output_created(self, event: dict[str, Any]) -> None: ...
    def ingest_audit_record_finalized(self, event: dict[str, Any]) -> None: ...


class NoopLedgerEventIngestor:
    """Event ingestion seam for future Canton projection synchronization.

    TODO: ingest Canton events, synchronize projections, and checkpoint ledger offsets.
    """

    def ingest_campaign_created(self, event: dict[str, Any]) -> None:
        return None

    def ingest_contribution_submission_created(self, event: dict[str, Any]) -> None:
        return None

    def ingest_submission_reviewed(self, event: dict[str, Any]) -> None:
        return None

    def ingest_processing_run_updated(self, event: dict[str, Any]) -> None:
        return None

    def ingest_benchmark_release_published(self, event: dict[str, Any]) -> None:
        return None

    def ingest_institution_output_created(self, event: dict[str, Any]) -> None:
        return None

    def ingest_audit_record_finalized(self, event: dict[str, Any]) -> None:
        return None
