import type { CampaignData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";

export interface OperatorContributeData {
  metrics: RoleMetric[];
  qualityDistribution: string[];
  exceptions: string[];
  actions: RoleAction[];
}

export interface AuditorContributeData {
  policy: RoleMetric[];
  controls: string[];
  actions: RoleAction[];
}

export function useDeskContribute(data: CampaignData): ViewResult<CampaignData> {
  return data ? { status: "ready", data } : { status: "empty" };
}

export function useOperatorContribute(): ViewResult<OperatorContributeData> {
  return {
    status: "ready",
    data: {
      metrics: [
        { label: "Campaign Configuration", value: "Q2 repo-treasury cycle", detail: "Active fields, thresholds, and reward policy configured" },
        { label: "Participation Rate", value: "74%", detail: "Eligible institutions with at least one submitted class" },
        { label: "Validation State", value: "12 passed / 7 pending", detail: "Policy checks across submitted packages" }
      ],
      qualityDistribution: ["Self-reported: 22%", "System-signed: 51%", "Oracle / custodian-attested: 27%"],
      exceptions: ["2 threshold mismatches", "3 attestation window reviews", "2 field completeness checks"],
      actions: [
        { title: "Review Submission", body: "Open the exceptions queue and resolve validation blockers." },
        { title: "Approve Release", body: "Mark validated contribution batches eligible for processing." }
      ]
    }
  };
}

export function useAuditorContribute(): ViewResult<AuditorContributeData> {
  return {
    status: "ready",
    data: {
      policy: [
        { label: "Contribution Policy", value: "Active", detail: "Campaign policy has enforceable field and assurance requirements" },
        { label: "Accepted Submission Classes", value: "3", detail: "Self-reported, system-signed, and custodian-attested submissions" },
        { label: "Attestation Rules", value: "Bound", detail: "Attested submissions must link to recognized source references" },
        { label: "Policy Enforcement State", value: "Passing", detail: "Current queue has no release-blocking policy drift" }
      ],
      controls: ["Retention controls enforced", "Out-of-policy contributions remain review-only", "Accepted classes mapped to benchmark weights"],
      actions: [
        { title: "Open Evidence Package", body: "Inspect policy controls, accepted classes, and attestation rules." },
        { title: "View Audit Trail", body: "Review contribution policy changes and enforcement events." }
      ]
    }
  };
}
