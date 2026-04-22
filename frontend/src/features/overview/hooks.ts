import type { OverviewData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";

export interface OperatorOverviewData {
  metrics: RoleMetric[];
  health: RoleMetric[];
  actions: RoleAction[];
}

export interface AuditorOverviewData {
  metrics: RoleMetric[];
  releaseScope: string[];
  actions: RoleAction[];
}

export function useDeskOverview(data: OverviewData): ViewResult<OverviewData> {
  return data.kpis.length ? { status: "ready", data } : { status: "empty" };
}

export function useOperatorOverview(): ViewResult<OperatorOverviewData> {
  return {
    status: "ready",
    data: {
      metrics: [
        { label: "Active Campaigns", value: "3", detail: "Contribution windows currently accepting institutional submissions" },
        { label: "Contributor Depth", value: "28", detail: "Eligible contributors in active repo and treasury scenarios" },
        { label: "Attested Coverage", value: "68%", detail: "Inputs backed by system, oracle, or custodian attestation" },
        { label: "Benchmark Reliability", value: "91.4%", detail: "Trust-weighted construction quality for the current cycle" }
      ],
      health: [
        { label: "Pending Validations", value: "7", detail: "Submissions waiting for policy and assurance review" },
        { label: "Processing Health", value: "Nominal", detail: "TEE execution queue inside target runtime thresholds" }
      ],
      actions: [
        { title: "Trigger Benchmark Run", body: "Start the next deterministic run for validated contribution batches." },
        { title: "Review Submission", body: "Open pending exceptions and contribution quality checks." }
      ]
    }
  };
}

export function useAuditorOverview(): ViewResult<AuditorOverviewData> {
  return {
    status: "ready",
    data: {
      metrics: [
        { label: "Benchmark Reliability", value: "91.4%", detail: "Reliability score linked to attested cohort depth" },
        { label: "Attestation Coverage", value: "68%", detail: "Coverage available for evidence package review" },
        { label: "Retention Compliance", value: "Enforced", detail: "Raw payload persistence disabled outside runtime" },
        { label: "Audit Trail Status", value: "Current", detail: "Latest release references are audit-package ready" }
      ],
      releaseScope: [
        "Benchmark reliability package",
        "Cohort-level benchmark metrics",
        "Institution-scoped comparison output",
        "Attestation reference",
        "No raw institutional contribution data"
      ],
      actions: [
        { title: "View Audit Package", body: "Inspect benchmark evidence, attestations, and release scope." },
        { title: "View Audit Trail", body: "Review the chronological record for this benchmark cycle." }
      ]
    }
  };
}
