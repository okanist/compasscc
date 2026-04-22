from typing import Any

from ..schemas import AttestationReferenceDTO, AuditRecordDTO, BenchmarkSnapshotDTO, InstitutionOutputDTO


class AuditPackageService:
    def build_package(
        self,
        *,
        snapshot: BenchmarkSnapshotDTO | None,
        output: InstitutionOutputDTO | None,
        attestation: AttestationReferenceDTO,
        record: AuditRecordDTO,
    ) -> dict[str, Any]:
        return {
            "record": record,
            "attestation": attestation,
            "benchmark_snapshot_id": snapshot.id if snapshot else None,
            "institution_output_id": output.id if output else None,
            "release_scope": record.release_scope_json,
            "evidence_refs": [
                attestation.ref_code,
                "retention-policy-checkpoint",
                "disclosure-boundary-manifest",
                "release-scope-manifest",
            ],
        }
