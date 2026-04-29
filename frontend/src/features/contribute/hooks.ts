import type { CampaignData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useCallback, useEffect, useState } from "react";
import {
  approveOperatorRelease,
  getDeskCampaign,
  getOperatorCampaign,
  getOperatorOverview,
  getOperatorPendingSubmissions,
  getAuditorPolicyEvidence,
  reviewOperatorSubmission,
  submitDeskContribution,
  triggerOperatorProcessing
} from "../../data/api";

export interface DeskContributeResult extends ViewResult<CampaignData> {
  submit: (submissionType: string) => Promise<number | null>;
  submitStatus: "idle" | "submitting" | "success" | "error";
  submitMessage?: string;
}

export interface OperatorContributeData {
  metrics: RoleMetric[];
  qualityDistribution: string[];
  exceptions: string[];
  actions: RoleAction[];
  pendingSubmissions: import("../../data/types").OperatorPendingSubmission[];
  context: {
    campaignId: number;
    latestRunId: number;
    triggerEnabled: boolean;
    triggerMessage: string;
    approveReleaseEnabled: boolean;
    approveReleaseMessage: string;
    releaseReadiness: string;
    processingHealth: string;
  };
}

export interface OperatorContributeResult extends ViewResult<OperatorContributeData> {
  reviewSubmission: (submissionId: number, decision: "approved" | "rejected" | "needs_attestation") => Promise<void>;
  triggerProcessing: () => Promise<void>;
  approveRelease: () => Promise<void>;
  refresh: () => Promise<void>;
  actionStatus: "idle" | "submitting" | "success" | "error";
  actionMessage?: string;
}

export interface AuditorContributeData {
  policy: RoleMetric[];
  controls: string[];
  actions: RoleAction[];
  classes: string[];
  weightMapping: string[];
  evidenceContext: {
    campaignTitle?: string;
    scenario?: string;
    policyStatus?: string;
    acceptedClassesCount?: number;
    pendingReviews?: number;
    submittedPackages?: number;
    releasedCycle: boolean;
    recordLifecycle?: string;
    recordReference?: string | null;
    message: string;
  };
}

export function useDeskContribute(data: CampaignData): DeskContributeResult {
  const [result, setResult] = useState<ViewResult<CampaignData>>({ status: "loading" });
  const [submitStatus, setSubmitStatus] = useState<DeskContributeResult["submitStatus"]>("idle");
  const [submitMessage, setSubmitMessage] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    getDeskCampaign(data.id ?? 1)
      .then((payload) => {
        if (!cancelled) {
          setResult(payload ? { status: "ready", data: payload } : { status: "empty" });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setResult(data ? { status: "ready", data } : { status: "error", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data]);

  const submit = useCallback(
    async (submissionType: string) => {
      if (!result.data) {
        return null;
      }

      setSubmitStatus("submitting");
      setSubmitMessage(undefined);

      try {
        const response = await submitDeskContribution(
          result.data.id ?? 1,
          submissionType,
          result.data.requestedFields,
          result.data.contributionPackage?.previewFields ?? []
        );
        const refreshed = await getDeskCampaign(result.data.id ?? 1);
        setResult({ status: "ready", data: refreshed });
        setSubmitStatus("success");
        setSubmitMessage(response.message);
        return response.related_resource_id ?? 1;
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "Contribution submission failed.");
        return null;
      }
    },
    [result.data]
  );

  return { ...result, submit, submitStatus, submitMessage };
}

export function useOperatorContribute(): OperatorContributeResult {
  const [result, setResult] = useState<ViewResult<OperatorContributeData>>({ status: "loading" });
  const [actionStatus, setActionStatus] = useState<OperatorContributeResult["actionStatus"]>("idle");
  const [actionMessage, setActionMessage] = useState<string>();

  const load = useCallback(async () => {
    const [campaignPayload, overviewPayload, pendingSubmissions] = await Promise.all([
      getOperatorCampaign(1),
      getOperatorOverview(),
      getOperatorPendingSubmissions()
    ]);
    const campaign = campaignPayload.campaign;
    const submissions = campaignPayload.submissions ?? [];
    const overviewContext = overviewPayload.overview_sections?.operator ?? {};
    const totalInstitutions = 3;
    const submittedCount = submissions.length;
    const approvedCount = submissions.filter((item: any) => item.review_status === "approved").length;
    const needsAttestationCount = submissions.filter((item: any) => item.review_status === "needs_attestation").length;
    const rejectedCount = submissions.filter((item: any) => item.review_status === "rejected").length;
    const releaseReadiness = overviewContext.release_readiness ?? "draft";
    const processingHealth = overviewContext.processing_health ?? "not_started";
    const qualityCounts = submissions.reduce((acc: Record<string, number>, item: any) => {
      acc[item.submission_type] = (acc[item.submission_type] ?? 0) + 1;
      return acc;
    }, {});
    const qualityDistribution = Object.entries(qualityCounts).map(([type, count]) => {
      const suffix = type.includes("Oracle") ? "policy-recognized class, simulated in MVP" : "submitted package class";
      return `${type}: ${count} ${Number(count) === 1 ? "package" : "packages"} (${suffix})`;
    });
    const approveReleaseEnabled = ["release_pending", "completed"].includes(processingHealth) && releaseReadiness !== "approved";
    setResult({
      status: "ready",
      data: {
        metrics: [
          { label: "Campaign Configuration", value: campaign.title, detail: `${campaign.scenario} | Min reputation ${campaign.min_reputation_threshold}` },
          { label: "Participation Rate", value: `${Math.round((submittedCount / totalInstitutions) * 100)}%`, detail: `${submittedCount} of ${totalInstitutions} demo institutions have submitted packages` },
          { label: "Validation State", value: `${approvedCount} approved / ${pendingSubmissions.length} pending`, detail: `${needsAttestationCount} need attestation, ${rejectedCount} rejected` },
          { label: "Processing State", value: processingHealth.replace(/_/g, " "), detail: `Release readiness: ${releaseReadiness.replace(/_/g, " ")}` }
        ],
        qualityDistribution: qualityDistribution.length ? qualityDistribution : ["No submitted contribution packages yet"],
        exceptions: pendingSubmissions.length
          ? pendingSubmissions.map((item) => `${item.institution}: ${item.review_status.replace(/_/g, " ")} | ${item.policy_status} | ${item.attestation_status}`)
          : ["No pending submission reviews remain"],
        actions: campaignPayload.actions ?? [],
        pendingSubmissions,
        context: {
          campaignId: overviewContext.campaign_id ?? campaign.id,
          latestRunId: overviewContext.latest_run_id ?? 1,
          triggerEnabled: Boolean(overviewContext.trigger_enabled),
          triggerMessage: overviewContext.trigger_message ?? "Review submitted contribution packages before triggering benchmark processing.",
          approveReleaseEnabled,
          approveReleaseMessage: approveReleaseEnabled
            ? "Approve benchmark release once processing is complete and release checks are ready."
            : "Benchmark release approval becomes available after processing reaches release readiness.",
          releaseReadiness,
          processingHealth
        }
      }
    });
  }, []);

  useEffect(() => {
    void load().catch((error: Error) => setResult({ status: "error", message: error.message }));
  }, [load]);

  const reviewSubmission = async (submissionId: number, decision: "approved" | "rejected" | "needs_attestation") => {
    setActionStatus("submitting");
    setActionMessage(undefined);
    try {
      const response = await reviewOperatorSubmission(submissionId, decision);
      await load();
      setActionStatus("success");
      setActionMessage(response.message);
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error instanceof Error ? error.message : "Submission review failed.");
    }
  };

  const triggerProcessing = async () => {
    const context = result.data?.context;
    if (!context?.triggerEnabled) {
      setActionStatus("error");
      setActionMessage(context?.triggerMessage ?? "Review submissions first.");
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

  const approveRelease = async () => {
    const context = result.data?.context;
    if (!context?.approveReleaseEnabled) {
      setActionStatus("error");
      setActionMessage(context?.approveReleaseMessage ?? "Release is not ready for approval.");
      return;
    }
    setActionStatus("submitting");
    setActionMessage(undefined);
    try {
      const response = await approveOperatorRelease(context.latestRunId);
      await load();
      setActionStatus("success");
      setActionMessage(response.message);
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error instanceof Error ? error.message : "Release approval failed.");
    }
  };

  return { ...result, reviewSubmission, triggerProcessing, approveRelease, refresh: load, actionStatus, actionMessage };
}

export function useAuditorContribute(): ViewResult<AuditorContributeData> {
  const [result, setResult] = useState<ViewResult<AuditorContributeData>>({ status: "loading" });

  const load = useCallback((cancelledRef?: { cancelled: boolean }) => {
    return getAuditorPolicyEvidence(1)
      .then((payload) => {
        if (cancelledRef?.cancelled) {
          return;
        }

        const policy = payload.contribution_policy ?? {};
        const evidenceContext = policy.evidence_context ?? {};
        const acceptedClasses = policy.accepted_submission_classes ?? [];
        setResult({
          status: "ready",
          data: {
            policy: [
              {
                label: "Contribution Policy Status",
                value: policy.policy_status ?? payload.campaign?.status ?? "Unknown",
                detail: payload.campaign?.title
              },
              {
                label: "Accepted Submission Classes",
                value: String(evidenceContext.accepted_classes_count ?? acceptedClasses.length),
                detail: acceptedClasses.map((item: any) => item.type).join(", ")
              },
              {
                label: "Attestation Rules State",
                value: policy.attestation_rules_state ?? "Configured",
                detail: "System-signed and policy-recognized custodian-attested classes are evidence-bound"
              },
              {
                label: "Policy Enforcement State",
                value: policy.policy_enforcement_state ?? "Configured",
                detail: evidenceContext.message
              },
              {
                label: "Retention Controls",
                value: "Configured",
                detail: policy.retention_controls
              },
              {
                label: "Record Lifecycle",
                value: String(evidenceContext.record_lifecycle ?? "not_finalized").replace(/_/g, " "),
                detail: evidenceContext.record_reference ?? "Finalized reference appears after audit record completion"
              }
            ],
            controls: [
              policy.retention_controls,
              policy.out_of_policy_rule,
              "Accepted classes mapped to benchmark weights"
            ].filter(Boolean),
            classes: acceptedClasses.map(
              (item: any) =>
                `${item.type}: ${item.benchmark_weight} weight | ${item.attestation_rule} | ${item.evidence_status}`
            ),
            weightMapping: policy.weight_mapping ?? [],
            actions: payload.actions ?? [],
            evidenceContext: {
              campaignTitle: evidenceContext.campaign_title,
              scenario: evidenceContext.scenario,
              policyStatus: evidenceContext.policy_status,
              acceptedClassesCount: evidenceContext.accepted_classes_count,
              pendingReviews: evidenceContext.pending_reviews,
              submittedPackages: evidenceContext.submitted_packages,
              releasedCycle: Boolean(evidenceContext.released_cycle),
              recordLifecycle: evidenceContext.record_lifecycle,
              recordReference: evidenceContext.record_reference,
              message:
                evidenceContext.message ??
                "Contribution policy evidence is loaded from the auditor policy projection."
            }
          }
        });
      })
      .catch((error: Error) => {
        if (!cancelledRef?.cancelled) {
          setResult({ status: "error", message: error.message });
        }
      });
  }, []);

  useEffect(() => {
    const cancelledRef = { cancelled: false };

    void load(cancelledRef);

    const handleAuditContextUpdated = () => {
      void load();
    };

    window.addEventListener("compass:audit-context-updated", handleAuditContextUpdated);
    window.addEventListener("focus", handleAuditContextUpdated);

    return () => {
      cancelledRef.cancelled = true;
      window.removeEventListener("compass:audit-context-updated", handleAuditContextUpdated);
      window.removeEventListener("focus", handleAuditContextUpdated);
    };
  }, [load]);

  return result;
}
