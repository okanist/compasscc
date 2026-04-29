import type { AuditorAuditRecordData, PositionData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useCallback, useEffect, useState } from "react";
import { getAuditorAuditRecord, getAuditorInstitutionOutput, getDeskPosition, getOperatorInstitutionOutput, recordDeskPosition } from "../../data/api";

export interface DeskMyPositionResult extends ViewResult<PositionData> {
  record: () => Promise<void>;
  refresh: () => Promise<void>;
  recordStatus: "idle" | "recording" | "success" | "error";
  recordMessage?: string;
}

export interface OperatorInstitutionReviewData {
  metrics: RoleMetric[];
  handoff: string[];
  actions: RoleAction[];
  summary: string;
  context?: PositionData["context"];
}

export interface AuditorOutputAuditData {
  metrics: RoleMetric[];
  scope: string[];
  recordMetrics: RoleMetric[];
  evidenceRefs: string[];
  integrityNotes: string[];
  actions: RoleAction[];
}

export interface AuditorAuditRecordViewData {
  metrics: RoleMetric[];
  releaseScope: string[];
  evidenceRefs: string[];
  auditTrail: string[];
  integrityNotes: string[];
  recordPackage: RoleMetric[];
  actions: RoleAction[];
  context: AuditorAuditRecordData["context"];
}

export function useDeskMyPosition(data: PositionData): DeskMyPositionResult {
  const [result, setResult] = useState<ViewResult<PositionData>>({ status: "loading" });
  const [recordStatus, setRecordStatus] = useState<DeskMyPositionResult["recordStatus"]>("idle");
  const [recordMessage, setRecordMessage] = useState<string>();

  const refresh = useCallback(async () => {
    setResult((current) => ({ status: current.data ? "ready" : "loading", data: current.data }));
    return getDeskPosition(data.context?.selectedScenario)
      .then((payload) => {
        setResult({ status: "ready", data: payload });
      })
      .catch((error: Error) => {
        setResult(data.metrics.length || data.context ? { status: "ready", data } : { status: "error", message: error.message });
      });
  }, [data]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const record = useCallback(async () => {
    if (!result.data?.outputId) {
      return;
    }

    setRecordStatus("recording");
    setRecordMessage(undefined);

    try {
      const response = await recordDeskPosition(result.data.outputId);
      const refreshed = await getDeskPosition(result.data.context?.selectedScenario);
      setResult({ status: "ready", data: refreshed });
      setRecordStatus("success");
      setRecordMessage(response.message);
      window.dispatchEvent(new CustomEvent("compass:audit-context-updated"));
    } catch (error) {
      setRecordStatus("error");
      setRecordMessage(error instanceof Error ? error.message : "Record-to-Canton action failed.");
    }
  }, [result.data]);

  return { ...result, record, refresh, recordStatus, recordMessage };
}

export function useOperatorInstitutionReview(): ViewResult<OperatorInstitutionReviewData> {
  const [result, setResult] = useState<ViewResult<OperatorInstitutionReviewData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getOperatorInstitutionOutput(1)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        const output = payload.output;
        const context = payload.output_context ?? {};
        const metrics = output
          ? [
              { label: "Selected Institution", value: context.institution_name ?? "Alpha Bank", detail: "Operator-safe institution-scoped output review" },
              { label: "Output ID", value: String(output.id), detail: context.benchmark_reference ?? `Snapshot ${output.benchmark_snapshot_id}` },
              { label: "Benchmark Delta", value: `${output.delta_vs_benchmark > 0 ? "+" : ""}${output.delta_vs_benchmark.toFixed(1)} pts`, detail: "Derived delta between institution output and cohort benchmark" },
              { label: "Release Eligibility", value: output.release_status === "approved" ? "Approved / Released" : "Not Ready", detail: `Current release state: ${output.release_status.replace(/_/g, " ")}` },
              { label: "Confidence", value: output.confidence_level, detail: "Confidence supported by benchmark reliability and attestation coverage" },
              { label: "Record Lifecycle", value: context.record_lifecycle?.replace(/_/g, " ") ?? "draft", detail: context.canton_record_ref ?? "Canton-style reference pending" }
            ]
          : [
              { label: "Selected Institution", value: context.institution_name ?? "Alpha Bank", detail: "Operator-safe institution-scoped output review" },
              { label: "Output Availability", value: "Not Ready", detail: context.not_ready_message ?? "Release approval is required before output review." },
              { label: "Release Eligibility", value: "Pending", detail: "Benchmark release has not been approved." },
              { label: "Record Lifecycle", value: "Not Ready", detail: "No institution-scoped record lifecycle is available yet." }
            ];

        setResult({
          status: "ready",
          data: {
            metrics,
            handoff: output ? payload.audit_handoff ?? [] : ["Release approval pending", "Institution output unavailable", "No Canton-style record reference yet"],
            actions: payload.actions ?? [],
            summary: output ? payload.explainable_summary : payload.output_context?.not_ready_message ?? payload.explainable_summary,
            context: {
              outputReady: Boolean(context.output_ready),
              recordable: false,
              selectedScenario: context.selected_scenario,
              institutionName: context.institution_name,
              benchmarkReference: context.benchmark_reference,
              recordLifecycle: context.record_lifecycle,
              createdAt: context.created_at ? new Date(context.created_at).toLocaleString() : undefined,
              recordedAt: context.recorded_at ? new Date(context.recorded_at).toLocaleString() : undefined,
              privacySummary: context.privacy_summary,
              notReadyMessage: context.not_ready_message
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

export function useAuditorOutputAudit(): ViewResult<AuditorOutputAuditData> {
  const [result, setResult] = useState<ViewResult<AuditorOutputAuditData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    Promise.all([getAuditorInstitutionOutput(1), getAuditorAuditRecord(1)])
      .then(([outputPayload, recordPayload]: [any, AuditorAuditRecordData]) => {
        if (cancelled) {
          return;
        }

        const output = outputPayload.output;
        const recordRef =
          recordPayload.metrics.find((metric) => metric.label === "Canton Record Ref")?.value ?? "Pending";

        setResult({
          status: "ready",
          data: {
            metrics: [
              { label: "Institution Name", value: "Alpha Bank", detail: "Institution-scoped released output under audit review" },
              { label: "Output ID", value: String(output.id), detail: `Run ${output.processing_run_id}` },
              { label: "Release Status", value: output.release_status, detail: "Institution output release state" },
              { label: "Delta Summary", value: `${output.delta_vs_benchmark > 0 ? "+" : ""}${output.delta_vs_benchmark.toFixed(1)} pts`, detail: "Benchmark-relative output" },
              { label: "Risk Tier", value: output.risk_tier, detail: "Released derived risk tier" },
              { label: "Confidence Level", value: output.confidence_level, detail: "Attestation-linked confidence level" },
              { label: "Attestation-linked Summary", value: "Available", detail: output.explainable_summary },
              { label: "Record Reference", value: recordRef, detail: "Ledger-oriented audit reference" },
              { label: "Release Timestamp", value: new Date(output.created_at).toLocaleString(), detail: "Output creation time" }
            ],
            scope: recordPayload.releaseScope,
            recordMetrics: recordPayload.metrics,
            evidenceRefs: recordPayload.evidenceRefs,
            integrityNotes: recordPayload.integrityNotes,
            actions: outputPayload.actions ?? []
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

export function useAuditorAuditRecord(): ViewResult<AuditorAuditRecordViewData> {
  const [result, setResult] = useState<ViewResult<AuditorAuditRecordViewData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getAuditorAuditRecord(1)
      .then((recordPayload) => {
        if (cancelled) {
          return;
        }

        setResult({
          status: "ready",
          data: {
            metrics: recordPayload.metrics,
            releaseScope: recordPayload.releaseScope,
            evidenceRefs: recordPayload.evidenceRefs,
            auditTrail: recordPayload.auditTrail.length ? recordPayload.auditTrail : [recordPayload.context.lifecycleMessage ?? "Audit record not finalized yet"],
            integrityNotes: recordPayload.integrityNotes,
            recordPackage: [
              { label: "Record Lifecycle", value: recordPayload.context.finalized ? "Finalized" : "Not finalized", detail: recordPayload.context.lifecycleMessage },
              { label: "Canton-style Record Reference", value: recordPayload.context.cantonRecordRef ?? "Pending", detail: "Read-only finalized reference when available" },
              { label: "Institution", value: recordPayload.context.institution ?? "Alpha Bank", detail: "Institution-scoped audit record" },
              { label: "Output ID", value: recordPayload.context.outputId ? String(recordPayload.context.outputId) : "Unavailable", detail: "Released output reference" },
              { label: "Benchmark Snapshot", value: recordPayload.context.benchmarkSnapshotReference ?? "Awaiting release", detail: "Benchmark audit linkage" },
              { label: "Attestation Reference", value: recordPayload.context.attestationReference ?? "Pending", detail: recordPayload.context.retentionStatus ?? "No raw payload retention" },
              { label: "Raw Data Exposure", value: recordPayload.context.rawDataExposure ?? "None", detail: "No payload dumps or peer positions" }
            ],
            actions: [
              { title: "Open Record Package", body: "Inspect read-only audit record references and lifecycle state." },
              { title: "View Benchmark Audit", body: "Review benchmark release audit evidence." },
              { title: "View Output Audit", body: "Review institution-scoped derived output audit evidence." },
              { title: "Back to Audit Overview", body: "Return to auditor overview state." }
            ],
            context: recordPayload.context
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
