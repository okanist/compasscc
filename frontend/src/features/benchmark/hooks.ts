import type { BenchmarkData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useCallback, useEffect, useState } from "react";
import { approveOperatorRelease, getAuditorInstitutionOutput, getDeskBenchmark, getOperatorOverview, getOperatorProcessing, triggerOperatorProcessing } from "../../data/api";

export interface OperatorBenchmarkData {
  metrics: RoleMetric[];
  construction: string[];
  actions: RoleAction[];
  context: {
    campaignId: number;
    runId: number;
    scenario?: string;
    cohortDepth: string;
    contributionMix: string;
    releaseHistory: string;
    triggerEnabled: boolean;
    triggerMessage: string;
    approveReleaseEnabled: boolean;
    approveReleaseMessage: string;
    releaseReadiness: string;
    processingHealth: string;
    simulatedTeeStatus: string;
    rawDataExposure: string;
    outputAvailable: boolean;
  };
}

export interface OperatorBenchmarkResult extends ViewResult<OperatorBenchmarkData> {
  triggerProcessing: () => Promise<void>;
  approveRelease: () => Promise<void>;
  refresh: () => Promise<void>;
  actionStatus: "idle" | "submitting" | "success" | "error";
  actionMessage?: string;
}

export interface AuditorBenchmarkData {
  metrics: RoleMetric[];
  scope: string[];
  evidencePackage: RoleMetric[];
  evidenceRefs: string[];
  integrityNotes: string[];
  actions: RoleAction[];
  context: {
    outputReady: boolean;
    releasePending: boolean;
    auditTrailAvailable: boolean;
    notReadyMessage: string;
  };
}

export function useDeskBenchmark(data: BenchmarkData, scenario: string): ViewResult<BenchmarkData> & { refresh: () => Promise<void> } {
  const [result, setResult] = useState<ViewResult<BenchmarkData>>({ status: "loading" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ status: current.data ? "ready" : "loading", data: current.data }));
    return getDeskBenchmark(scenario)
      .then((payload) => {
        setResult(payload.primaryMetrics.length ? { status: "ready", data: payload } : { status: "empty" });
      })
      .catch((error: Error) => {
        setResult(data.primaryMetrics.length ? { status: "ready", data } : { status: "error", message: error.message });
      });
  }, [data, scenario]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, refresh };
}

export function useOperatorBenchmark(): OperatorBenchmarkResult {
  const [result, setResult] = useState<ViewResult<OperatorBenchmarkData>>({ status: "loading" });
  const [actionStatus, setActionStatus] = useState<OperatorBenchmarkResult["actionStatus"]>("idle");
  const [actionMessage, setActionMessage] = useState<string>();

  const refresh = useCallback(async () => {
    const overview = await getOperatorOverview();
    const overviewMetrics = overview.metrics ?? [];
    const operatorContext = overview.overview_sections?.operator ?? {};
    const processing = await getOperatorProcessing(operatorContext.latest_run_id ?? 1);
    const processingContext = processing.processing_context ?? {};
    const releaseReadiness = processingContext.release_readiness ?? operatorContext.release_readiness ?? "draft";
    const processingHealth = processingContext.processing_health ?? operatorContext.processing_health ?? processing.run?.run_status ?? "not_started";
    const contributorDepth = overviewMetrics.find((metric: RoleMetric) => metric.label === "Contributor Depth")?.value ?? "0";
    const attestedCoverage = overviewMetrics.find((metric: RoleMetric) => metric.label === "Attested Coverage")?.value ?? "0%";
    const reliability = overviewMetrics.find((metric: RoleMetric) => metric.label === "Benchmark Reliability")?.value ?? "0%";
    const pending = processingContext.pending_reviews ?? operatorContext.pending_validations ?? 0;
    const approved = processingContext.approved_submissions ?? operatorContext.approved_submissions ?? 0;
    const releaseReady = ["release_pending", "completed", "released"].includes(processing.run?.run_status ?? "");
    setResult({
      status: "ready",
      data: {
        metrics: [
          { label: "Scenario-wide Metrics", value: processingContext.scenario ?? "Active scenario", detail: "Operator-safe benchmark construction scope" },
          { label: "Cohort Depth", value: `${contributorDepth} contributors`, detail: "Validated contributors in the active benchmark view" },
          { label: "Verified Contribution Mix", value: `${approved} approved / ${pending} pending`, detail: "System-signed and policy-recognized attested submissions" },
          { label: "Release Status", value: releaseReadiness.replace(/_/g, " "), detail: `Processing state: ${processingHealth.replace(/_/g, " ")}` }
        ],
        construction: [
          Number.parseFloat(String(reliability)) >= 50 ? "Reliability above release threshold" : "Reliability below release threshold",
          attestedCoverage !== "0%" ? "Attested coverage meets policy" : "Attested coverage not ready",
          releaseReady ? "Release candidate assembled" : "Release candidate not assembled",
          pending ? "Pending reviews block benchmark recompute" : "Validated batch ready for benchmark lifecycle"
        ],
        actions: processing.actions ?? [],
        context: {
          campaignId: operatorContext.campaign_id ?? processing.run?.campaign_id ?? 1,
          runId: processing.run?.id ?? operatorContext.latest_run_id ?? 1,
          scenario: processingContext.scenario,
          cohortDepth: `${contributorDepth} contributors`,
          contributionMix: `${approved} approved / ${pending} pending`,
          releaseHistory: releaseReadiness === "approved" ? "1 approved release" : "No approved release yet",
          triggerEnabled: Boolean(processingContext.trigger_enabled),
          triggerMessage: processingContext.trigger_message ?? operatorContext.trigger_message ?? "Review submissions before triggering benchmark processing.",
          approveReleaseEnabled: Boolean(processingContext.approve_release_enabled),
          approveReleaseMessage: processingContext.approve_release_message ?? "Release approval becomes available after processing completes.",
          releaseReadiness,
          processingHealth,
          simulatedTeeStatus: processingContext.simulated_tee_status ?? "Not started",
          rawDataExposure: processingContext.raw_data_exposure ?? "None",
          outputAvailable: Boolean(processingContext.output_available)
        }
      }
    });
  }, []);

  useEffect(() => {
    void refresh().catch((error: Error) => setResult({ status: "error", message: error.message }));
  }, [refresh]);

  const triggerProcessing = async () => {
    if (!result.data?.context.triggerEnabled) {
      setActionStatus("error");
      setActionMessage(result.data?.context.triggerMessage ?? "Benchmark run is not ready to trigger.");
      return;
    }
    setActionStatus("submitting");
    setActionMessage(undefined);
    try {
      const response = await triggerOperatorProcessing(result.data.context.campaignId);
      await refresh();
      setActionStatus("success");
      setActionMessage(response.message);
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error instanceof Error ? error.message : "Benchmark trigger failed.");
    }
  };

  const approveRelease = async () => {
    if (!result.data?.context.approveReleaseEnabled) {
      setActionStatus("error");
      setActionMessage(result.data?.context.approveReleaseMessage ?? "Release approval is not ready.");
      return;
    }
    setActionStatus("submitting");
    setActionMessage(undefined);
    try {
      const response = await approveOperatorRelease(result.data.context.runId);
      await refresh();
      setActionStatus("success");
      setActionMessage(response.message);
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error instanceof Error ? error.message : "Release approval failed.");
    }
  };

  return { ...result, triggerProcessing, approveRelease, refresh, actionStatus, actionMessage };
}

export function useAuditorBenchmark(): ViewResult<AuditorBenchmarkData> {
  const [result, setResult] = useState<ViewResult<AuditorBenchmarkData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const labelValue = (value: unknown): string => {
      const labels: Record<string, string> = {
        approved: "Approved / Released",
        published: "Published",
        release_pending: "Release pending",
        release_gated: "Release-gated / Pending",
        unavailable: "Unavailable",
        available: "Available / Ready",
        package_ready: "Package ready",
        awaiting_benchmark_release: "Awaiting benchmark release",
        draft: "Draft",
        finalized: "Finalized",
        not_ready: "Not ready",
      };
      const key = String(value ?? "not_ready");
      return labels[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    };

    getAuditorInstitutionOutput(1)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        const output = payload.output;
        const context = payload.output_context ?? {};
        const outputReady = Boolean(context.output_ready);
        const releasePending = Boolean(context.release_pending);
        const recordLifecycle = labelValue(context.record_lifecycle);
        const cantonRef = context.canton_record_ref ?? "Pending";
        const generatedAt = context.generated_at ? new Date(context.generated_at).toLocaleString() : "Awaiting released output";
        const releasedAt = context.released_at ? new Date(context.released_at).toLocaleString() : "Awaiting release approval";
        const finalizedAt = context.finalized_at ? new Date(context.finalized_at).toLocaleString() : "Not finalized";
        const releaseStatus = labelValue(context.release_status);
        const outputStatus = labelValue(context.output_status);
        const handoffReadiness = labelValue(context.handoff_readiness);
        const benchmarkReference = context.benchmark_reference ?? "Awaiting benchmark release";
        const outputId = context.output_id ?? output?.id;

        setResult({
          status: "ready",
          data: {
            metrics: [
              { label: "Selected Institution", value: context.selected_institution ?? "Alpha Bank", detail: "Institution-scoped derived output audit" },
              { label: "Output ID", value: outputReady || releasePending ? `Output ${outputId ?? "pending"}` : "No released output", detail: outputReady ? `Run ${context.run_id ?? "released"}` : "No fake institution output audit is shown" },
              { label: "Scenario", value: context.scenario ?? "Active scenario", detail: "Output audit scenario" },
              { label: "Benchmark Reference", value: benchmarkReference, detail: context.snapshot_reference ?? "Snapshot reference appears after release processing" },
              { label: "Release Status", value: releaseStatus, detail: "Backend release state" },
              { label: "Output Status", value: outputStatus, detail: "Institution output availability" },
              { label: "Benchmark Delta", value: outputReady && typeof context.benchmark_delta === "number" ? `${context.benchmark_delta > 0 ? "+" : ""}${context.benchmark_delta.toFixed(1)} pts` : "Awaiting released output", detail: "Derived benchmark-relative output" },
              { label: "Confidence", value: outputReady ? context.confidence ?? "Available" : "Awaiting released output", detail: "Audit-safe confidence metadata" },
              { label: "Risk Tier", value: outputReady ? context.risk_tier ?? "Available" : "Awaiting released output", detail: "Derived risk tier, shown only after release" },
              { label: "Handoff Readiness", value: handoffReadiness, detail: "Release-approved output package state" },
              { label: "Record Lifecycle", value: recordLifecycle, detail: "Read-only record lifecycle" },
              { label: "Canton-style Record Reference", value: cantonRef, detail: context.canton_record_ref ? "Finalized read-only evidence reference" : "Appears after Institution Desk records to Canton" },
              { label: "Attestation Reference", value: context.attestation_reference ?? "Pending", detail: "Released processing attestation reference" },
              { label: "Generated", value: generatedAt, detail: "Generated output timestamp" },
              { label: "Released", value: releasedAt, detail: "Release approval timestamp" },
              { label: "Finalized", value: finalizedAt, detail: "Record finalization timestamp" }
            ],
            scope: context.release_scope ?? [
              "Institution-scoped derived output",
              "Record lifecycle",
              "No raw institutional contribution data",
            ],
            evidencePackage: [
              { label: "Selected Institution", value: context.selected_institution ?? "Alpha Bank", detail: "Auditor-safe institution scope" },
              { label: "Output Package", value: outputReady ? "Release-approved output package" : releasePending ? "Release-gated output package" : "Awaiting benchmark release", detail: outputReady ? `Output ${outputId}` : context.not_ready_message },
              { label: "Benchmark Reference", value: benchmarkReference, detail: "Benchmark snapshot linkage" },
              { label: "Attestation Reference", value: context.attestation_reference ?? "Pending", detail: "Consistent released run evidence reference" },
              { label: "Record Lifecycle", value: recordLifecycle, detail: "No Record to Canton control exposed to Auditor" },
              { label: "Canton-style Record Reference", value: cantonRef, detail: "Read-only finalized reference when available" },
              { label: "Disclosure Boundary", value: "No raw institutional contribution data", detail: "No raw peer positions or named peer breakdowns" }
            ],
            evidenceRefs: [
              context.benchmark_reference ? `Benchmark reference: ${context.benchmark_reference}` : undefined,
              context.attestation_reference ? `Attestation reference: ${context.attestation_reference}` : undefined,
              outputReady ? `Output reference: Output ${outputId}` : undefined,
              context.canton_record_ref ? `Audit record reference: ${context.canton_record_ref}` : undefined,
            ].filter(Boolean) as string[],
            integrityNotes: [
              outputReady ? "Institution-scoped derived output is release-approved." : context.not_ready_message ?? "Institution output audit is not ready.",
              "No raw institutional contribution fields are displayed.",
              "No raw peer positions or named peer breakdowns are displayed.",
              "Institution Desk recommendation/action cards are excluded from Auditor output audit."
            ],
            actions: payload.actions ?? [],
            context: {
              outputReady,
              releasePending,
              auditTrailAvailable: Boolean(context.canton_record_ref || context.record_lifecycle),
              notReadyMessage: context.not_ready_message ?? "Institution-scoped output audit is awaiting benchmark release approval."
            }
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
