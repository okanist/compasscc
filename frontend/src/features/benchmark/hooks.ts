import type { BenchmarkData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";

export interface OperatorBenchmarkData {
  metrics: RoleMetric[];
  construction: string[];
  actions: RoleAction[];
}

export interface AuditorBenchmarkData {
  metrics: RoleMetric[];
  notes: string[];
  actions: RoleAction[];
}

export function useDeskBenchmark(data: BenchmarkData): ViewResult<BenchmarkData> {
  return data.primaryMetrics.length ? { status: "ready", data } : { status: "empty" };
}

export function useOperatorBenchmark(): ViewResult<OperatorBenchmarkData> {
  return {
    status: "ready",
    data: {
      metrics: [
        { label: "Scenario-wide Metrics", value: "Repo + treasury", detail: "Active benchmark scenario across collateral and settlement terms" },
        { label: "Cohort Depth", value: "24 contributors", detail: "Validated contributors included in benchmark construction" },
        { label: "Contribution Mix", value: "78% verified", detail: "System-signed and attested submissions in the included cohort" },
        { label: "Release History", value: "6 packages", detail: "Published benchmark packages for this campaign family" }
      ],
      construction: ["Reliability above release threshold", "Attested coverage meets policy", "Dispersion flagged for interpretation", "Release candidate assembled"],
      actions: [
        { title: "Trigger Benchmark Run", body: "Recompute scenario-wide metrics from the latest validated batch." },
        { title: "Approve Release", body: "Promote release candidate once construction checks pass." }
      ]
    }
  };
}

export function useAuditorBenchmark(): ViewResult<AuditorBenchmarkData> {
  return {
    status: "ready",
    data: {
      metrics: [
        { label: "Methodology Summary", value: "Trust-weighted", detail: "Benchmark uses contribution depth, assurance class, and confidence tier" },
        { label: "Reliability", value: "91.4%", detail: "Current release candidate reliability score" },
        { label: "Attested Coverage", value: "68%", detail: "Coverage supporting benchmark audit package" },
        { label: "Released Output Scope", value: "Derived only", detail: "Scope excludes raw institutional contribution fields" }
      ],
      notes: ["Methodology version: COMPASS-BENCH-Q2", "Cohort anonymity threshold satisfied", "Distribution released without institution-level raw positions"],
      actions: [
        { title: "View Audit Package", body: "Inspect methodology, reliability, coverage, and released scope." },
        { title: "View Audit Trail", body: "Review benchmark construction and release events." }
      ]
    }
  };
}
