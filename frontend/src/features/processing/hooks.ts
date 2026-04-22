import type { ProcessingData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";

export interface OperatorProcessingData {
  jobs: RoleMetric[];
  lifecycle: string[];
  actions: RoleAction[];
}

export interface AuditorProcessingData {
  guarantees: RoleMetric[];
  evidence: string[];
  actions: RoleAction[];
}

export function useDeskProcessing(data: ProcessingData): ViewResult<ProcessingData> {
  return data.steps.length ? { status: "ready", data } : { status: "empty" };
}

export function useOperatorProcessing(): ViewResult<OperatorProcessingData> {
  return {
    status: "ready",
    data: {
      jobs: [
        { label: "Processing Jobs", value: "4 active", detail: "Benchmark jobs queued or executing inside confidential runtime" },
        { label: "Execution States", value: "2 running / 2 staged", detail: "Current lifecycle across active campaign batches" },
        { label: "Failure / Retry Markers", value: "1 retry", detail: "Retry marker isolated to contribution completeness validation" },
        { label: "Release Readiness", value: "82%", detail: "Validated outputs approaching release threshold" }
      ],
      lifecycle: ["Batch validated", "TEE run staged", "Deterministic engine executing", "Output package assembled", "Release approval pending"],
      actions: [
        { title: "Trigger Benchmark Run", body: "Start a run from validated contribution batches." },
        { title: "Approve Release", body: "Move ready output packages into release approval." }
      ]
    }
  };
}

export function useAuditorProcessing(): ViewResult<AuditorProcessingData> {
  return {
    status: "ready",
    data: {
      guarantees: [
        { label: "Runtime Guarantees", value: "TEE enabled", detail: "Execution boundary and deterministic compute path active" },
        { label: "Attestation Chain", value: "Linked", detail: "Run reference connected to evidence package" },
        { label: "Disclosure Boundary", value: "Derived outputs only", detail: "No raw contribution data released" },
        { label: "Retention Enforcement", value: "None retained", detail: "Raw payload persistence blocked outside runtime" }
      ],
      evidence: ["TEE-ATTEST-Q2-REPONET-014", "Retention policy checkpoint", "Disclosure boundary manifest", "Release scope manifest"],
      actions: [
        { title: "Open Evidence Package", body: "Inspect attestation, disclosure, and retention references." },
        { title: "View Audit Trail", body: "Open run lifecycle events and release checkpoints." }
      ]
    }
  };
}
