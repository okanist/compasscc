import type { ProcessingData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useEffect, useState } from "react";
import { approveOperatorRelease, getAuditorBenchmarkAudit, getAuditorProcessingEvidence, getDeskProcessing, getOperatorOverview, getOperatorProcessing, triggerOperatorProcessing } from "../../data/api";

export interface OperatorProcessingData {
  jobs: RoleMetric[];
  lifecycle: string[];
  actions: RoleAction[];
  runId: number;
  campaignId: number;
  context: {
    campaignTitle?: string;
    scenario?: string;
    pendingReviews: number;
    approvedSubmissions: number;
    triggerEnabled: boolean;
    triggerMessage: string;
    approveReleaseEnabled: boolean;
    approveReleaseMessage: string;
    releaseReadiness: string;
    simulatedTeeStatus: string;
    rawDataExposure: string;
    outputAvailable: boolean;
  };
}

export interface OperatorProcessingResult extends ViewResult<OperatorProcessingData> {
  trigger: () => Promise<void>;
  approveRelease: () => Promise<void>;
  refresh: () => Promise<void>;
  actionStatus: "idle" | "submitting" | "success" | "error";
  actionMessage?: string;
}

export interface AuditorProcessingData {
  snapshot: RoleMetric[];
  constructionQuality: string[];
  processingEvidence: RoleMetric[];
  releaseScope: string[];
  evidenceReferences: string[];
  evidencePackage: RoleMetric[];
  actions: RoleAction[];
  context: {
    evidencePackageAvailable: boolean;
    outputAuditAvailable: boolean;
    auditTrailAvailable: boolean;
    notReadyMessage: string;
  };
}

export interface DeskProcessingResult extends ViewResult<ProcessingData> {
  refresh: () => Promise<void>;
  refreshStatus: "idle" | "loading" | "error";
  refreshMessage?: string;
}

export function useDeskProcessing(data: ProcessingData): DeskProcessingResult {
  const [result, setResult] = useState<ViewResult<ProcessingData>>({ status: "loading" });
  const [refreshStatus, setRefreshStatus] = useState<DeskProcessingResult["refreshStatus"]>("idle");
  const [refreshMessage, setRefreshMessage] = useState<string>();

  const load = async () => {
    const payload = await getDeskProcessing(data.runId ?? 1);
    setResult(payload.steps.length ? { status: "ready", data: payload } : { status: "empty" });
  };

  useEffect(() => {
    let cancelled = false;

    load()
      .then(() => {
        if (!cancelled) {
          setRefreshStatus("idle");
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setResult(data.steps.length ? { status: "ready", data } : { status: "error", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data]);

  const refresh = async () => {
    setRefreshStatus("loading");
    setRefreshMessage(undefined);
    try {
      await load();
      setRefreshStatus("idle");
    } catch (error) {
      setRefreshStatus("error");
      setRefreshMessage(error instanceof Error ? error.message : "Processing refresh failed.");
    }
  };

  return { ...result, refresh, refreshStatus, refreshMessage };
}

export function useOperatorProcessing(): OperatorProcessingResult {
  const [runId, setRunId] = useState(1);
  const [result, setResult] = useState<ViewResult<OperatorProcessingData>>({ status: "loading" });
  const [actionStatus, setActionStatus] = useState<OperatorProcessingResult["actionStatus"]>("idle");
  const [actionMessage, setActionMessage] = useState<string>();

  const load = async (targetRunId?: number) => {
    const overview = await getOperatorOverview();
    const latestRunId = overview.overview_sections?.operator?.latest_run_id ?? runId;
    const payload = await getOperatorProcessing(targetRunId ?? latestRunId);
    const run = payload.run;
    const context = payload.processing_context ?? {};
    setRunId(run.id);
    setResult({
      status: "ready",
      data: {
        jobs: payload.metrics ?? [],
        lifecycle: payload.lifecycle ?? [],
        actions: payload.actions ?? [],
        runId: run.id,
        campaignId: run.campaign_id,
        context: {
          campaignTitle: context.campaign_title,
          scenario: context.scenario,
          pendingReviews: context.pending_reviews ?? 0,
          approvedSubmissions: context.approved_submissions ?? 0,
          triggerEnabled: Boolean(context.trigger_enabled),
          triggerMessage: context.trigger_message ?? "Review submissions before triggering benchmark processing.",
          approveReleaseEnabled: Boolean(context.approve_release_enabled),
          approveReleaseMessage: context.approve_release_message ?? "Release approval becomes available after benchmark processing completes.",
          releaseReadiness: context.release_readiness ?? "draft",
          simulatedTeeStatus: context.simulated_tee_status ?? "Not started",
          rawDataExposure: context.raw_data_exposure ?? "None",
          outputAvailable: Boolean(context.output_available)
        }
      }
    });
  };

  useEffect(() => {
    let cancelled = false;
    load().catch((error: Error) => {
      if (!cancelled) {
        setResult({ status: "error", message: error.message });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const trigger = async () => {
    const campaignId = result.data?.campaignId ?? 1;
    if (!result.data?.context.triggerEnabled) {
      setActionStatus("error");
      setActionMessage(result.data?.context.triggerMessage ?? "Review submissions before triggering benchmark processing.");
      return;
    }
    setActionStatus("submitting");
    setActionMessage(undefined);
    try {
      const response = await triggerOperatorProcessing(campaignId);
      await load(response.resource_id ?? runId);
      setActionStatus("success");
      setActionMessage(response.message);
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error instanceof Error ? error.message : "Processing trigger failed.");
    }
  };

  const approveRelease = async () => {
    const targetRunId = result.data?.runId ?? runId;
    if (!result.data?.context.approveReleaseEnabled) {
      setActionStatus("error");
      setActionMessage(result.data?.context.approveReleaseMessage ?? "Release approval is not ready.");
      return;
    }
    setActionStatus("submitting");
    setActionMessage(undefined);
    try {
      const response = await approveOperatorRelease(targetRunId);
      await load(targetRunId);
      setActionStatus("success");
      setActionMessage(response.message);
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error instanceof Error ? error.message : "Release approval failed.");
    }
  };

  return { ...result, trigger, approveRelease, refresh: load, actionStatus, actionMessage };
}

export function useAuditorProcessing(): ViewResult<AuditorProcessingData> {
  const [result, setResult] = useState<ViewResult<AuditorProcessingData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const labelValue = (value: unknown): string => {
      const labels: Record<string, string> = {
        tee_deterministic: "Simulated TEE deterministic runtime",
        raw_retention_disabled: "No raw payload retention",
        draft: "Draft / Not ready",
        not_started: "Not started",
        release_pending: "Release pending",
        released: "Released / Approved",
        approved: "Released / Approved",
        completed: "Completed",
        published: "Published",
      };
      const key = String(value ?? "not_started");
      return labels[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    };

    getAuditorBenchmarkAudit(1)
      .then(async (benchmarkPayload) => {
        if (cancelled) {
          return;
        }

        const snapshot = benchmarkPayload.snapshot;
        const context = benchmarkPayload.benchmark_context ?? {};
        const processingPayload = await getAuditorProcessingEvidence(context.run_id ?? snapshot?.processing_run_id ?? 1);
        if (cancelled) {
          return;
        }
        const run = processingPayload.run;
        const released = Boolean(context.released);
        const releasePending = Boolean(context.release_pending);
        const snapshotLabel = context.snapshot_id ? `Snapshot ${context.snapshot_id}` : "No released snapshot";
        const evidenceRefs = [
          context.attestation_ref ? `Attestation reference: ${context.attestation_ref}` : undefined,
          context.benchmark_snapshot_ref ? `Benchmark snapshot reference: ${context.benchmark_snapshot_ref}` : undefined,
          context.release_ref ? `Release reference: ${context.release_ref}` : undefined,
          context.audit_record_ref ? `Audit record reference: ${context.audit_record_ref}` : undefined,
        ].filter(Boolean) as string[];
        const reliability = released && snapshot ? `${snapshot.reliability_score.toFixed(1)}%` : "Awaiting benchmark release";
        const coverage = released && snapshot ? `${Math.round(snapshot.attested_coverage * 100)}%` : "Awaiting benchmark release";
        const cohortDepth = released ? `${context.cohort_depth ?? snapshot?.contributor_count ?? 0} contributors` : "Awaiting benchmark release";
        const releaseState = released ? "Released / Approved" : releasePending ? "Release pending" : "Not started / Awaiting benchmark release";
        const hasProcessingEvidence = run.run_status !== "not_started";

        setResult({
          status: "ready",
          data: {
            snapshot: [
              { label: "Snapshot ID", value: snapshotLabel, detail: released ? "Latest released benchmark snapshot" : "No fake released snapshot is shown" },
              { label: "Run ID", value: `Run ${context.run_id ?? run.id}`, detail: `Campaign ${context.campaign_id ?? run.campaign_id}` },
              { label: "Scenario", value: context.scenario ?? snapshot?.scenario ?? "Active scenario", detail: "Benchmark audit scope" },
              { label: "Release Status", value: releaseState, detail: "Backend release lifecycle state" },
              { label: "Release Readiness", value: labelValue(context.release_readiness ?? run.notes_json?.release_readiness), detail: "Release package readiness marker" },
              { label: "Last Released", value: context.last_released_at ? new Date(context.last_released_at).toLocaleString() : "Awaiting benchmark release", detail: "Shown only after operator release approval" },
              { label: "Benchmark Reliability", value: reliability, detail: released ? "Released benchmark reliability" : "Held until release approval" },
              { label: "Attestation Coverage", value: coverage, detail: released ? "Released attestation coverage" : "Held until release approval" },
              { label: "Cohort Depth", value: cohortDepth, detail: "Released contributor depth" },
              { label: "Contribution Mix", value: context.contribution_mix ?? "Not started", detail: "Contribution review state" },
              { label: "Verified Mix", value: hasProcessingEvidence ? context.verified_mix ?? "Processing evidence available" : "Not started", detail: "Verified processing inputs" }
            ],
            constructionQuality: [
              released && snapshot && snapshot.reliability_score >= 50 ? "Reliability above release threshold" : released ? "Reliability below release threshold" : "Reliability check awaiting benchmark release",
              released && snapshot && snapshot.attested_coverage > 0 ? "Attested coverage meets policy" : released ? "Attested coverage not ready" : "Attested coverage awaiting benchmark release",
              snapshot?.alerts_json?.includes("ELEVATED_DISPERSION") ? "Dispersion flagged for interpretation" : "Dispersion not flagged for interpretation",
              released ? "Release candidate approved" : releasePending ? "Release candidate assembled / awaiting approval" : "Release candidate not assembled",
              "Derived outputs only"
            ],
            processingEvidence: [
              { label: "Run Status", value: labelValue(run.run_status), detail: "Processing lifecycle state" },
              { label: "Runtime Mode", value: labelValue(run.runtime_mode), detail: "Confidential deterministic compute path" },
              { label: "Simulated TEE Runtime", value: run.runtime_mode === "tee_deterministic" ? "Simulated TEE deterministic runtime" : labelValue(run.runtime_mode), detail: "Runtime evidence label" },
              { label: "Retention Policy", value: labelValue(run.retention_policy_status), detail: "Raw payload persistence boundary" },
              { label: "Disclosure Boundary", value: "Derived outputs only", detail: "No raw institution or peer contribution data exposed" },
              { label: "Attestation Reference", value: run.attestation_ref ?? "Pending", detail: "Runtime attestation reference" },
              { label: "Evidence References", value: (processingPayload.evidence_refs ?? []).length ? (processingPayload.evidence_refs ?? []).join(", ") : "Pending", detail: "Processing evidence reference list" }
            ],
            releaseScope: [
              "Benchmark reliability package",
              "Cohort-level benchmark metrics",
              "Institution-scoped comparison output",
              "Attestation reference",
              "No raw institutional contribution data"
            ],
            evidenceReferences: evidenceRefs,
            evidencePackage: [
              { label: "Benchmark Snapshot", value: snapshotLabel, detail: releaseState },
              { label: "Processing Run", value: `Run ${run.id}`, detail: labelValue(run.run_status) },
              { label: "Runtime", value: labelValue(run.runtime_mode), detail: labelValue(run.retention_policy_status) },
              { label: "Attestation Reference", value: run.attestation_ref ?? "Pending", detail: "No raw package payloads included" },
              { label: "Release Scope", value: "Derived outputs only", detail: "No raw institutional data exposure" },
              { label: "Audit Record Reference", value: context.audit_record_ref ?? "Pending", detail: labelValue(context.audit_record_status) }
            ],
            actions: benchmarkPayload.actions ?? [],
            context: {
              evidencePackageAvailable: released || releasePending || hasProcessingEvidence,
              outputAuditAvailable: released,
              auditTrailAvailable: Boolean(context.audit_record_id),
              notReadyMessage: "No evidence references available until benchmark processing is completed."
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
