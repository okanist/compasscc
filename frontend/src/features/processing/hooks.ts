import type { ProcessingData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useEffect, useState } from "react";
import { approveOperatorRelease, getAuditorProcessingEvidence, getDeskProcessing, getOperatorProcessing, triggerOperatorProcessing } from "../../data/api";

export interface OperatorProcessingData {
  jobs: RoleMetric[];
  lifecycle: string[];
  actions: RoleAction[];
  runId: number;
  campaignId: number;
}

export interface OperatorProcessingResult extends ViewResult<OperatorProcessingData> {
  trigger: () => Promise<void>;
  approveRelease: () => Promise<void>;
  actionStatus: "idle" | "submitting" | "success" | "error";
  actionMessage?: string;
}

export interface AuditorProcessingData {
  guarantees: RoleMetric[];
  evidence: string[];
  stepSummary: string[];
  actions: RoleAction[];
}

export function useDeskProcessing(data: ProcessingData): ViewResult<ProcessingData> {
  const [result, setResult] = useState<ViewResult<ProcessingData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getDeskProcessing(data.runId ?? 1)
      .then((payload) => {
        if (!cancelled) {
          setResult(payload.steps.length ? { status: "ready", data: payload } : { status: "empty" });
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

  return result;
}

export function useOperatorProcessing(): OperatorProcessingResult {
  const [runId, setRunId] = useState(1);
  const [result, setResult] = useState<ViewResult<OperatorProcessingData>>({ status: "loading" });
  const [actionStatus, setActionStatus] = useState<OperatorProcessingResult["actionStatus"]>("idle");
  const [actionMessage, setActionMessage] = useState<string>();

  const load = async (targetRunId = runId) => {
    const payload = await getOperatorProcessing(targetRunId);
    const run = payload.run;
    setRunId(run.id);
    setResult({
      status: "ready",
      data: {
        jobs: payload.metrics ?? [],
        lifecycle: payload.lifecycle ?? [],
        actions: payload.actions ?? [],
        runId: run.id,
        campaignId: run.campaign_id
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

  return { ...result, trigger, approveRelease, actionStatus, actionMessage };
}

export function useAuditorProcessing(): ViewResult<AuditorProcessingData> {
  const [result, setResult] = useState<ViewResult<AuditorProcessingData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getAuditorProcessingEvidence(1)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        const run = payload.run;
        setResult({
          status: "ready",
          data: {
            guarantees: [
              { label: "Run ID", value: String(run.id), detail: `Campaign ${run.campaign_id}` },
              { label: "Run Status", value: run.run_status, detail: "Processing lifecycle state" },
              { label: "Attestation Ref", value: run.attestation_ref ?? "Pending", detail: "Runtime attestation reference" },
              { label: "Runtime Guarantees", value: run.runtime_mode, detail: "TEE-enabled deterministic compute path" },
              { label: "Retention Policy", value: run.retention_policy_status, detail: "Raw payload persistence boundary" },
              { label: "Disclosure Boundary", value: "Derived outputs only", detail: "No raw contribution data released" },
              { label: "Release Readiness", value: String(run.notes_json?.release_readiness ?? "draft"), detail: "Release package readiness marker" }
            ],
            evidence: payload.evidence_refs ?? [],
            stepSummary: payload.lifecycle ?? [],
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
