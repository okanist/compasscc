import { fallbackData } from "./fallback";
import type {
  ApiPayload,
  AuditorAuditRecordData,
  BenchmarkData,
  CampaignData,
  CommandResult,
  OperatorPendingSubmission,
  OverviewData,
  PositionData,
  ProcessingData
} from "./types";

const API_BASE_URL = import.meta.env.VITE_CRTI_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Compass API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function titleCase(value: string | undefined): string {
  if (!value) {
    return "Unknown";
  }

  return value.replace(/_/g, " ").replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function mapOverviewProjection(payload: any): OverviewData {
  const summaries = Array.isArray(payload.summaries) ? payload.summaries : [];

  return {
    kpis: (payload.metrics ?? []).map((metric: any) => ({
      label: metric.label,
      value: metric.value,
      tone: metric.tone
    })),
    informationBand: {
      title: "Privacy-Preserving Institutional Contribution",
      body:
        summaries[0] ??
        "Institutions contribute selected fields under policy. Raw positions never leave the confidential boundary."
    },
    processStrip: [
      "Private Contribution",
      "Confidential Processing",
      "Trust-Weighted Benchmark",
      "Position Intelligence",
      "Auditable Output"
    ]
  };
}

function mapCampaignProjection(payload: any): CampaignData {
  const latestSubmission = payload.submissions?.[payload.submissions.length - 1];

  return {
    id: payload.campaign.id,
    title: payload.campaign.title,
    scenario: payload.campaign.scenario,
    requestedFields: payload.requested_fields ?? [],
    minimumReputationThreshold: `${payload.campaign.min_reputation_threshold.toFixed(2)} network trust score`,
    contributionReward: "Benchmark access uplift + campaign incentive credit",
    contributionTypes: ["Self-reported", "System-signed", "Oracle / custodian-attested"],
    policySummary: payload.policy_summary,
    participationStatus: latestSubmission
      ? `${titleCase(latestSubmission.review_status)} (${latestSubmission.submission_type})`
      : "Not submitted",
    contributorQualityTier: latestSubmission?.policy_status ? titleCase(latestSubmission.policy_status) : "Ready",
    confidenceTier: payload.campaign.confidence_tier_required,
    teeProcessingEnabled: payload.campaign.tee_processing_enabled ? "Yes" : "No",
    latestSubmissionStatus: latestSubmission?.review_status,
    processingRunId: 1
  };
}

function mapProcessingProjection(payload: any): ProcessingData {
  const run = payload.run;
  const evidenceRefs = payload.evidence_refs ?? [];

  return {
    runId: run.id,
    status: run.run_status,
    headline: "Raw data goes in. Only intelligence comes out.",
    body:
      "Compass uses confidential processing to ingest contribution fields inside a controlled environment, execute deterministic analytics, and return only derived benchmark intelligence plus institution-scoped outputs.",
    evidenceRefs,
    steps: [
      { label: "Run status", value: titleCase(run.run_status) },
      { label: "Raw institutional data received", value: `${run.input_count} selected contribution packages accepted` },
      { label: "Processed inside confidential environment", value: titleCase(run.runtime_mode) },
      { label: "Persistent storage disabled", value: titleCase(run.retention_policy_status) },
      { label: "Deterministic engine executed", value: `${run.valid_submission_count} valid / ${run.invalid_submission_count} invalid inputs` },
      { label: "Derived outputs generated", value: payload.lifecycle?.[3] ?? "Institution outputs generated" },
      { label: "Attestation reference", value: run.attestation_ref ?? evidenceRefs[0] ?? "Pending" },
      { label: "Raw data retention", value: "None" }
    ]
  };
}

function mapBenchmarkProjection(payload: any): BenchmarkData {
  return {
    scenarioOptions: [payload.snapshot.scenario],
    selectedScenario: payload.snapshot.scenario,
    primaryMetrics: payload.primary_metrics ?? [],
    secondaryMetrics: payload.secondary_metrics ?? [],
    alerts: payload.alerts ?? []
  };
}

function mapPositionProjection(payload: any): PositionData {
  return {
    outputId: payload.output.id,
    metrics: payload.metrics ?? [],
    suggestedInterpretation: payload.interpretation,
    explainableSummary: payload.explainable_summary,
    recommendedActions: payload.recommended_actions ?? [],
    auditHandoff: payload.audit_handoff ?? [],
    recordStatus: payload.audit_record?.record_status,
    cantonRecordRef: payload.audit_record?.canton_record_ref ?? null
  };
}

export async function getDeskOverview(): Promise<OverviewData> {
  return mapOverviewProjection(await apiFetch("/api/desk/overview"));
}

export async function getDeskCampaign(campaignId = 1): Promise<CampaignData> {
  return mapCampaignProjection(await apiFetch(`/api/desk/contribute/${campaignId}`));
}

export async function submitDeskContribution(
  campaignId: number,
  submissionType: string,
  requestedFields: string[]
): Promise<CommandResult> {
  const payload = Object.fromEntries(
    requestedFields.map((field, index) => [
      field,
      index === 0 ? "142M-188M" : index === 1 ? 4.92 : index === 2 ? "UST-heavy" : index === 3 ? "8-14 days" : "18.5%"
    ])
  );

  return apiFetch(`/api/desk/contribute/${campaignId}/submit`, {
    method: "POST",
    body: JSON.stringify({
      submission_type: submissionType,
      confidence_tier: submissionType === "Self-reported" ? "Medium" : "High",
      attestation_status:
        submissionType === "Oracle / custodian-attested"
          ? "attested"
          : submissionType === "System-signed"
            ? "system_signed"
            : "needs_attestation",
      payload
    })
  });
}

export async function getDeskProcessing(runId = 1): Promise<ProcessingData> {
  return mapProcessingProjection(await apiFetch(`/api/desk/processing/${runId}`));
}

export async function getDeskBenchmark(scenario?: string): Promise<BenchmarkData> {
  const query = scenario ? `?scenario=${encodeURIComponent(scenario)}` : "";
  return mapBenchmarkProjection(await apiFetch(`/api/desk/benchmark${query}`));
}

export async function getDeskPosition(scenario?: string): Promise<PositionData> {
  const query = scenario ? `?scenario=${encodeURIComponent(scenario)}` : "";
  return mapPositionProjection(await apiFetch(`/api/desk/my-position${query}`));
}

export async function recordDeskPosition(outputId: number): Promise<CommandResult> {
  return apiFetch(`/api/desk/my-position/${outputId}/record`, {
    method: "POST"
  });
}

export async function getOperatorOverview(): Promise<any> {
  return apiFetch("/api/operator/overview");
}

export async function getOperatorPendingSubmissions(): Promise<OperatorPendingSubmission[]> {
  return apiFetch("/api/operator/submissions/pending");
}

export async function reviewOperatorSubmission(
  submissionId: number,
  reviewStatus: "approved" | "rejected" | "needs_attestation"
): Promise<CommandResult> {
  return apiFetch(`/api/operator/submissions/${submissionId}/review`, {
    method: "POST",
    body: JSON.stringify({
      review_status: reviewStatus,
      policy_status: reviewStatus === "approved" ? "matched" : reviewStatus
    })
  });
}

export async function getOperatorProcessing(runId = 1): Promise<any> {
  return apiFetch(`/api/operator/processing/${runId}`);
}

export async function triggerOperatorProcessing(campaignId = 1): Promise<CommandResult> {
  return apiFetch(`/api/operator/processing/${campaignId}/trigger`, {
    method: "POST"
  });
}

export async function approveOperatorRelease(runId: number): Promise<CommandResult> {
  return apiFetch(`/api/operator/releases/${runId}/approve`, {
    method: "POST"
  });
}

export async function getOperatorInstitutionOutput(institutionId = 1): Promise<any> {
  return apiFetch(`/api/operator/institution-output/${institutionId}`);
}

export async function getAuditorOverview(): Promise<any> {
  return apiFetch("/api/auditor/overview");
}

export async function getAuditorProcessingEvidence(runId = 1): Promise<any> {
  return apiFetch(`/api/auditor/processing/${runId}/evidence`);
}

export async function getAuditorBenchmarkAudit(snapshotId = 1): Promise<any> {
  return apiFetch(`/api/auditor/benchmark/${snapshotId}/audit`);
}

export async function getAuditorInstitutionOutput(outputId = 1): Promise<any> {
  return apiFetch(`/api/auditor/institution-output/${outputId}`);
}

export async function getAuditorAuditRecord(recordId = 1): Promise<AuditorAuditRecordData> {
  const payload: any = await apiFetch(`/api/auditor/audit-records/${recordId}`);
  const record = payload.record;
  const attestation = payload.attestation;
  const releaseScope = payload.release_scope ?? {};
  const included = (releaseScope.included ?? []).map((item: string) => `Included: ${item}`);
  const excluded = (releaseScope.excluded ?? []).map((item: string) => `Excluded: ${item}`);

  return {
    metrics: [
      { label: "Record ID", value: String(record.id), detail: "Audit record identifier" },
      { label: "Record Status", value: titleCase(record.record_status), detail: record.recorded_at ? "Finalized timestamp available" : "Awaiting Canton finalization" },
      { label: "Output ID", value: String(record.institution_output_id ?? "n/a"), detail: "Institution-scoped output reference" },
      { label: "Snapshot ID", value: String(record.benchmark_snapshot_id ?? "n/a"), detail: "Benchmark snapshot reference" },
      { label: "Attestation Ref", value: attestation.ref_code, detail: attestation.attestation_type },
      { label: "Canton Record Ref", value: record.canton_record_ref ?? "Pending", detail: "Ledger-oriented record reference" },
      { label: "Created At", value: new Date(record.created_at).toLocaleString(), detail: `Created by ${record.created_by}` },
      { label: "Finalized At", value: record.recorded_at ? new Date(record.recorded_at).toLocaleString() : "Not finalized", detail: "recorded_to_canton state" },
      { label: "Recorded To Canton", value: record.canton_record_ref ? "Yes" : "No", detail: record.record_status }
    ],
    releaseScope: [...included, ...excluded],
    evidenceRefs: payload.evidence_refs ?? [],
    integrityNotes: [
      "Audit record links output, benchmark snapshot, and runtime attestation.",
      "Release scope excludes raw peer contributions and raw institution payload.",
      "Record integrity is seed-backed until Canton command finalization is connected."
    ]
  };
}

export async function loadCompassData(): Promise<ApiPayload> {
  try {
    const [overview, campaign, processing, benchmark, position] = await Promise.all([
      getDeskOverview(),
      getDeskCampaign(1),
      getDeskProcessing(1),
      getDeskBenchmark(),
      getDeskPosition()
    ]);

    return {
      overview,
      campaigns: [campaign],
      processing,
      benchmark,
      position,
      explainableSummary: { text: position.explainableSummary }
    } satisfies ApiPayload;
  } catch (_error) {
    return fallbackData;
  }
}
