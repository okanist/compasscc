import type { CampaignData } from "../../data/types";
import type { ViewResult } from "../../components/primitives/ViewState";
import type { RoleAction, RoleMetric } from "../../components/primitives/RoleViewSections";
import { useCallback, useEffect, useState } from "react";
import { getDeskCampaign, submitDeskContribution } from "../../data/api";

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
}

export interface AuditorContributeData {
  policy: RoleMetric[];
  controls: string[];
  actions: RoleAction[];
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

export function useOperatorContribute(): ViewResult<OperatorContributeData> {
  return {
    status: "ready",
    data: {
      metrics: [
        { label: "Campaign Configuration", value: "Q2 repo-treasury cycle", detail: "Active fields, thresholds, and reward policy configured" },
        { label: "Participation Rate", value: "74%", detail: "Eligible institutions with at least one submitted class" },
        { label: "Validation State", value: "12 passed / 7 pending", detail: "Policy checks across submitted packages" }
      ],
      qualityDistribution: ["Self-reported: 22%", "System-signed: 51%", "Oracle / custodian-attested: 27%"],
      exceptions: ["2 threshold mismatches", "3 attestation window reviews", "2 field completeness checks"],
      actions: [
        { title: "Review Submission", body: "Open the exceptions queue and resolve validation blockers." },
        { title: "Approve Release", body: "Mark validated contribution batches eligible for processing." }
      ]
    }
  };
}

export function useAuditorContribute(): ViewResult<AuditorContributeData> {
  return {
    status: "ready",
    data: {
      policy: [
        { label: "Contribution Policy", value: "Active", detail: "Campaign policy has enforceable field and assurance requirements" },
        { label: "Accepted Submission Classes", value: "3", detail: "Self-reported, system-signed, and custodian-attested submissions" },
        { label: "Attestation Rules", value: "Bound", detail: "Attested submissions must link to recognized source references" },
        { label: "Policy Enforcement State", value: "Passing", detail: "Current queue has no release-blocking policy drift" }
      ],
      controls: ["Retention controls enforced", "Out-of-policy contributions remain review-only", "Accepted classes mapped to benchmark weights"],
      actions: [
        { title: "Open Evidence Package", body: "Inspect policy controls, accepted classes, and attestation rules." },
        { title: "View Audit Trail", body: "Review contribution policy changes and enforcement events." }
      ]
    }
  };
}
