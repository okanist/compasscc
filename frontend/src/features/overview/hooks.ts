import type { OperatorPendingSubmission, OverviewData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useCallback, useEffect, useState } from "react";
import { getAuditorOverview, getDeskOverview, getOperatorOverview, getOperatorPendingSubmissions, reviewOperatorSubmission, triggerOperatorProcessing } from "../../data/api";

export interface OperatorOverviewData {
  metrics: RoleMetric[];
  health: RoleMetric[];
  actions: RoleAction[];
  pendingSubmissions: OperatorPendingSubmission[];
  operatorContext?: {
    pendingValidations: number;
    approvedSubmissions: number;
    triggerEnabled: boolean;
    triggerMessage: string;
    campaignId: number;
    processingHealth?: string;
    releaseReadiness?: string;
  };
}

export interface OperatorOverviewResult extends ViewResult<OperatorOverviewData> {
  reviewSubmission: (submissionId: number, decision: "approved" | "rejected" | "needs_attestation") => Promise<void>;
  triggerProcessing: () => Promise<void>;
  refresh: () => Promise<void>;
  reviewStatus: "idle" | "submitting" | "success" | "error";
  reviewMessage?: string;
  actionStatus: "idle" | "submitting" | "success" | "error";
  actionMessage?: string;
}

export interface AuditorOverviewData {
  metrics: RoleMetric[];
  releaseScope: string[];
  actions: RoleAction[];
  context: {
    releaseReady: boolean;
    packageAvailable: boolean;
    auditTrailAvailable: boolean;
    message: string;
    lastRunId?: number;
    lastRunStatus?: string;
    recordLifecycle?: string;
    recordReference?: string | null;
  };
}

export function useDeskOverview(data: OverviewData): ViewResult<OverviewData> {
  const [result, setResult] = useState<ViewResult<OverviewData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getDeskOverview()
      .then((payload) => {
        if (!cancelled) {
          setResult(payload.kpis.length ? { status: "ready", data: payload } : { status: "empty" });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setResult(data.kpis.length ? { status: "ready", data } : { status: "error", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data]);

  return result;
}

export function useOperatorOverview(): OperatorOverviewResult {
  const [result, setResult] = useState<ViewResult<OperatorOverviewData>>({ status: "loading" });
  const [reviewStatus, setReviewStatus] = useState<OperatorOverviewResult["reviewStatus"]>("idle");
  const [reviewMessage, setReviewMessage] = useState<string>();
  const [actionStatus, setActionStatus] = useState<OperatorOverviewResult["actionStatus"]>("idle");
  const [actionMessage, setActionMessage] = useState<string>();

  const load = useCallback(async () => {
    const [overview, pendingSubmissions] = await Promise.all([
      getOperatorOverview(),
      getOperatorPendingSubmissions()
    ]);
    const metrics = (overview.metrics ?? []).slice(0, 4);
    const health = (overview.metrics ?? []).slice(4);
    const operator = overview.overview_sections?.operator ?? {};
    setResult({
      status: "ready",
      data: {
        metrics,
        health,
        actions: overview.actions ?? [],
        pendingSubmissions,
        operatorContext: {
          pendingValidations: operator.pending_validations ?? pendingSubmissions.length,
          approvedSubmissions: operator.approved_submissions ?? 0,
          triggerEnabled: Boolean(operator.trigger_enabled),
          triggerMessage: operator.trigger_message ?? "Review submitted contribution packages before triggering benchmark processing.",
          campaignId: operator.campaign_id ?? 1,
          processingHealth: operator.processing_health,
          releaseReadiness: operator.release_readiness
        }
      }
    });
  }, []);

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
  }, [load]);

  const reviewSubmission = async (
    submissionId: number,
    decision: "approved" | "rejected" | "needs_attestation"
  ) => {
    setReviewStatus("submitting");
    setReviewMessage(undefined);
    try {
      const response = await reviewOperatorSubmission(submissionId, decision);
      await load();
      setReviewStatus("success");
      setReviewMessage(response.message);
    } catch (error) {
      setReviewStatus("error");
      setReviewMessage(error instanceof Error ? error.message : "Submission review failed.");
    }
  };

  const triggerProcessing = async () => {
    const context = result.data?.operatorContext;
    if (!context?.triggerEnabled) {
      setActionStatus("error");
      setActionMessage(context?.triggerMessage ?? "Review submitted contribution packages before triggering benchmark processing.");
      return;
    }

    setActionStatus("submitting");
    setActionMessage(undefined);
    try {
      const response = await triggerOperatorProcessing(context.campaignId);
      await load();
      setActionStatus("success");
      setActionMessage(response.message);
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error instanceof Error ? error.message : "Processing trigger failed.");
    }
  };

  return { ...result, reviewSubmission, triggerProcessing, refresh: load, reviewStatus, reviewMessage, actionStatus, actionMessage };
}

export function useAuditorOverview(): ViewResult<AuditorOverviewData> {
  const [result, setResult] = useState<ViewResult<AuditorOverviewData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getAuditorOverview()
      .then((payload) => {
        const auditorContext = payload.overview_sections?.auditor ?? {};
        if (!cancelled) {
          setResult({
            status: "ready",
            data: {
              metrics: payload.metrics ?? [],
              releaseScope: auditorContext.release_scope ?? [],
              actions: payload.actions ?? [],
              context: {
                releaseReady: Boolean(auditorContext.release_ready),
                packageAvailable: Boolean(auditorContext.package_available),
                auditTrailAvailable: Boolean(auditorContext.audit_trail_available),
                message:
                  auditorContext.message ??
                  "Audit state is loaded from backend evidence and release lifecycle projections.",
                lastRunId: auditorContext.last_run_id,
                lastRunStatus: auditorContext.last_run_status,
                recordLifecycle: auditorContext.record_lifecycle,
                recordReference: auditorContext.record_reference
              }
            }
          });
        }
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
