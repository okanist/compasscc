import type { BenchmarkData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useEffect, useState } from "react";
import { getAuditorBenchmarkAudit, getDeskBenchmark } from "../../data/api";

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
  const [result, setResult] = useState<ViewResult<BenchmarkData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getDeskBenchmark(data.selectedScenario)
      .then((payload) => {
        if (!cancelled) {
          setResult(payload.primaryMetrics.length ? { status: "ready", data: payload } : { status: "empty" });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setResult(data.primaryMetrics.length ? { status: "ready", data } : { status: "error", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data]);

  return result;
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
  const [result, setResult] = useState<ViewResult<AuditorBenchmarkData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getAuditorBenchmarkAudit(1)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        const snapshot = payload.snapshot;
        setResult({
          status: "ready",
          data: {
            metrics: [
              { label: "Scenario", value: snapshot.scenario, detail: "Benchmark audit scope" },
              { label: "Release Status", value: "Published", detail: `Snapshot ${snapshot.id}` },
              { label: "Reliability", value: `${snapshot.reliability_score.toFixed(1)}%`, detail: "Current release reliability score" },
              { label: "Attested Coverage", value: `${Math.round(snapshot.attested_coverage * 100)}%`, detail: "Coverage supporting audit package" },
              { label: "Methodology Summary", value: "Trust-weighted", detail: "Contribution depth, assurance class, and confidence tier" },
              { label: "Released Output Scope", value: "Derived only", detail: "Raw institutional positions excluded" },
              { label: "Snapshot Reference", value: `Snapshot ${snapshot.id}`, detail: `Run ${snapshot.processing_run_id}` },
              { label: "Release Timestamp", value: new Date(snapshot.created_at).toLocaleString(), detail: "Snapshot creation time" }
            ],
            notes: [
              "Methodology version: COMPASS-BENCH-Q2",
              "Cohort anonymity threshold satisfied",
              "Distribution released without institution-level raw positions",
              ...(payload.alerts ?? []).map((alert: string) => `Confidence note: ${alert}`)
            ],
            actions: payload.actions ?? []
          }
        });
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setResult({ status: "error", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
