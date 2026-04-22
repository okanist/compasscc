import type { PositionData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";

export interface OperatorInstitutionReviewData {
  metrics: RoleMetric[];
  handoff: string[];
  actions: RoleAction[];
}

export interface AuditorOutputAuditData {
  metrics: RoleMetric[];
  scope: string[];
  actions: RoleAction[];
}

export function useDeskMyPosition(data: PositionData): ViewResult<PositionData> {
  return data.metrics.length ? { status: "ready", data } : { status: "empty" };
}

export function useOperatorInstitutionReview(): ViewResult<OperatorInstitutionReviewData> {
  return {
    status: "ready",
    data: {
      metrics: [
        { label: "Selected Institution", value: "Alpha Bank", detail: "Institution-scoped output selected for operator review" },
        { label: "Benchmark Delta", value: "-6.3 pts", detail: "Delta between institution output and active benchmark" },
        { label: "Release Eligibility", value: "Eligible", detail: "Output package passes scoped release checks" },
        { label: "Confidence", value: "High", detail: "Confidence supported by attested benchmark reliability" }
      ],
      handoff: ["Institution-scoped output assembled", "Release boundary verified", "Audit handoff ready"],
      actions: [
        { title: "Approve Release", body: "Approve this institution output package for scoped release." },
        { title: "Review Submission", body: "Open the source validation summary for this institution." }
      ]
    }
  };
}

export function useAuditorOutputAudit(): ViewResult<AuditorOutputAuditData> {
  return {
    status: "ready",
    data: {
      metrics: [
        { label: "Institution Output Audit Mode", value: "Alpha Bank", detail: "Institution-scoped released output under audit review" },
        { label: "Attestation-linked Summary", value: "Available", detail: "Output summary linked to runtime attestation reference" },
        { label: "Record Reference", value: "CANTON-REC-2026-Q2-014", detail: "Ledger-oriented reference for audit package review" },
        { label: "Audit Trail", value: "Current", detail: "Release and evidence events are synchronized" }
      ],
      scope: ["Included: benchmark delta", "Included: risk tier", "Included: interpretation summary", "Excluded: raw peer contributions", "Excluded: raw institution payload"],
      actions: [
        { title: "Open Evidence Package", body: "Inspect attestation-linked output and record references." },
        { title: "View Audit Trail", body: "Open event history for this institution-scoped output." }
      ]
    }
  };
}
