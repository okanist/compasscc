import type { OperatorPendingSubmission, OverviewData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useEffect, useState } from "react";
import { getAuditorOverview, getDeskOverview, getOperatorOverview, getOperatorPendingSubmissions, reviewOperatorSubmission } from "../../data/api";

export interface OperatorOverviewData {
  metrics: RoleMetric[];
  health: RoleMetric[];
  actions: RoleAction[];
  pendingSubmissions: OperatorPendingSubmission[];
}

export interface OperatorOverviewResult extends ViewResult<OperatorOverviewData> {
  reviewSubmission: (submissionId: number, decision: "approved" | "rejected" | "needs_attestation") => Promise<void>;
  reviewStatus: "idle" | "submitting" | "success" | "error";
  reviewMessage?: string;
}

export interface AuditorOverviewData {
  metrics: RoleMetric[];
  releaseScope: string[];
  actions: RoleAction[];
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

  const load = async () => {
    const [overview, pendingSubmissions] = await Promise.all([
      getOperatorOverview(),
      getOperatorPendingSubmissions()
    ]);
    const metrics = (overview.metrics ?? []).slice(0, 4);
    const health = (overview.metrics ?? []).slice(4);
    setResult({
      status: "ready",
      data: {
        metrics,
        health,
        actions: overview.actions ?? [],
        pendingSubmissions
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

  return { ...result, reviewSubmission, reviewStatus, reviewMessage };
}

export function useAuditorOverview(): ViewResult<AuditorOverviewData> {
  const [result, setResult] = useState<ViewResult<AuditorOverviewData>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getAuditorOverview()
      .then((payload) => {
        if (!cancelled) {
          setResult({
            status: "ready",
            data: {
              metrics: payload.metrics ?? [],
              releaseScope: [
                "Benchmark reliability package",
                "Cohort-level benchmark metrics",
                "Institution-scoped comparison output",
                "Attestation reference",
                "No raw institutional contribution data"
              ],
              actions: payload.actions ?? []
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
