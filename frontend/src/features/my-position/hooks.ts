import type { AuditorAuditRecordData, PositionData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useCallback, useEffect, useState } from "react";
import { getAuditorAuditRecord, getAuditorInstitutionOutput, getDeskPosition, getOperatorInstitutionOutput, recordDeskPosition } from "../../data/api";

export interface DeskMyPositionResult extends ViewResult<PositionData> {
  record: () => Promise<void>;
  recordStatus: "idle" | "recording" | "success" | "error";
  recordMessage?: string;
}

export interface OperatorInstitutionReviewData {
  metrics: RoleMetric[];
  handoff: string[];
  actions: RoleAction[];
  summary: string;
}

export interface AuditorOutputAuditData {
  metrics: RoleMetric[];
  scope: string[];
  recordMetrics: RoleMetric[];
  evidenceRefs: string[];
  integrityNotes: string[];
  actions: RoleAction[];
}

export function useDeskMyPosition(data: PositionData): DeskMyPositionResult {
  const [result, setResult] = useState<ViewResult<PositionData>>({ status: "loading" });
  const [recordStatus, setRecordStatus] = useState<DeskMyPositionResult["recordStatus"]>("idle");
  const [recordMessage, setRecordMessage] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    getDeskPosition()
      .then((payload) => {
        if (!cancelled) {
          setResult(payload.metrics.length ? { status: "ready", data: payload } : { status: "empty" });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setResult(data.metrics.length ? { status: "ready", data } : { status: "error", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data]);

  const record = useCallback(async () => {
    if (!result.data?.outputId) {
      return;
    }

    setRecordStatus("recording");
    setRecordMessage(undefined);

    try {
      const response = await recordDeskPosition(result.data.outputId);
      const refreshed = await getDeskPosition();
      setResult({ status: "ready", data: refreshed });
      setRecordStatus("success");
      setRecordMessage(response.message);
    } catch (error) {
      setRecordStatus("error");
      setRecordMessage(error instanceof Error ? error.message : "Record-to-Canton action failed.");
    }
  }, [result.data]);

  return { ...result, record, recordStatus, recordMessage };
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
        const metrics = [
          { label: "Selected Institution", value: "Alpha Bank", detail: "Institution-scoped output selected for operator review" },
          { label: "Benchmark Delta", value: `${output.delta_vs_benchmark > 0 ? "+" : ""}${output.delta_vs_benchmark.toFixed(1)} pts`, detail: "Delta between institution output and active benchmark" },
          { label: "Release Eligibility", value: output.release_status === "approved" ? "Approved" : "Eligible", detail: `Current output release state: ${output.release_status.replace(/_/g, " ")}` },
          { label: "Confidence", value: output.confidence_level, detail: "Confidence supported by benchmark reliability and attestation coverage" }
        ];

        setResult({
          status: "ready",
          data: {
            metrics,
            handoff: payload.audit_handoff ?? [],
            actions: payload.actions ?? [],
            summary: payload.explainable_summary
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
