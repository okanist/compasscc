import { fallbackData } from "./fallback";
import type {
  ApiPayload,
  AuditorAuditRecordData,
  BenchmarkData,
  CampaignData,
  CommandResult,
  NavKey,
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

function navKey(value: unknown): NavKey | undefined {
  return value === "overview" || value === "campaign" || value === "processing" || value === "benchmark" || value === "position"
    ? value
    : undefined;
}

function recentRouteFromCategory(category: unknown): NavKey | undefined {
  if (category === "network_liquidity") {
    return "benchmark";
  }

  if (category === "institution_benchmark") {
    return "position";
  }

  if (category === "processing_reliability") {
    return "processing";
  }

  return undefined;
}

function mapOverviewProjection(payload: any): OverviewData {
  const summaries = Array.isArray(payload.summaries) ? payload.summaries : [];
  const overviewSections = payload.overview_sections ?? {};
  const benchmark = overviewSections.benchmark ?? {};
  const networkIntelligence = overviewSections.network_intelligence ?? {};

  return {
    kpis: (payload.metrics ?? []).map((metric: any) => ({
      label: metric.label,
      value: metric.value,
      detail: metric.detail,
      tone: metric.tone
    })),
    informationBand: {
      title: "Privacy-Preserving Institutional Contribution",
      body:
        summaries[1] ??
        summaries[0] ??
        "Institutions contribute selected fields under policy. Raw positions never leave the confidential boundary."
    },
    processStrip: [
      "Private Contribution",
      "Confidential Processing",
      "Trust-Weighted Benchmark",
      "Position Intelligence",
      "Auditable Output"
    ],
    deskOverview: {
      benchmark: {
        title: benchmark.title,
        averageLiquidity: benchmark.average_liquidity,
        delta: benchmark.delta,
        topQuartile: benchmark.top_quartile,
        median: benchmark.median,
        bottomQuartile: benchmark.bottom_quartile,
        interpretation: benchmark.interpretation
      },
      networkIntelligence: {
        subtitle: networkIntelligence.subtitle,
        eyebrow: networkIntelligence.eyebrow,
        headline: networkIntelligence.headline,
        body: networkIntelligence.body,
        route: navKey(networkIntelligence.route)
      },
      contributionCards: (overviewSections.contribution_cards ?? []).map((card: any) => ({
        title: card.title,
        status: card.status,
        action: card.action,
        tone: card.tone
      })),
      recentIntelligence: (overviewSections.recent_intelligence ?? []).map((item: any) => {
        if (typeof item === "string") {
          return { title: item };
        }

        return {
          category: item.category,
          title: item.title,
          meta: item.meta,
          route: navKey(item.route) ?? recentRouteFromCategory(item.category)
        };
      })
    }
  };
}

function mapCampaignProjection(payload: any): CampaignData {
  const ownSubmissions = (payload.submissions ?? []).filter((submission: any) => submission.institution_id === 1);
  const latestSubmission = ownSubmissions[ownSubmissions.length - 1] ?? payload.submissions?.[payload.submissions.length - 1];
  const packageData = payload.contribution_package ?? {};
  const policyData = payload.contribution_policy ?? {};
  const policyTypes = policyData.contribution_types ?? [];

  return {
    id: payload.campaign.id,
    title: payload.campaign.title,
    scenario: payload.campaign.scenario,
    requestedFields: payload.requested_fields ?? [],
    minimumReputationThreshold: `${payload.campaign.min_reputation_threshold.toFixed(2)} network trust score`,
    contributionReward: policyData.contribution_reward ?? "Benchmark access after contribution acceptance",
    contributionTypes: policyTypes.length
      ? policyTypes.map((item: any) => item.type)
      : ["Self-reported", "System-signed", "Oracle / custodian-attested"],
    policySummary: payload.policy_summary,
    participationStatus: latestSubmission
      ? `${titleCase(latestSubmission.review_status)} (${latestSubmission.submission_type})`
      : "Ready to Submit",
    contributorQualityTier: latestSubmission?.policy_status ? titleCase(latestSubmission.policy_status) : "Ready",
    confidenceTier: packageData.confidence_tier ?? payload.campaign.confidence_tier_required,
    teeProcessingEnabled: packageData.confidential_processing ?? (payload.campaign.tee_processing_enabled ? "Enabled" : "Disabled"),
    latestSubmissionStatus: latestSubmission?.review_status,
    selectedContributionType: packageData.selected_type ?? latestSubmission?.submission_type ?? "System-signed",
    attestationStatus: packageData.attestation_status ?? (latestSubmission?.attestation_status ? titleCase(latestSubmission.attestation_status) : "System Signed"),
    rawDataRetention: packageData.raw_data_retention,
    processingRunId: 1,
    contributionPackage: {
      status: packageData.status ?? (latestSubmission ? titleCase(latestSubmission.review_status) : "Ready"),
      selectedType: packageData.selected_type ?? latestSubmission?.submission_type ?? "System-signed",
      confidenceTier: packageData.confidence_tier ?? payload.campaign.confidence_tier_required,
      attestationStatus: packageData.attestation_status ?? (latestSubmission?.attestation_status ? titleCase(latestSubmission.attestation_status) : "System Signed"),
      rawDataRetention:
        packageData.raw_data_retention ??
        "Raw package values are not displayed or retained outside the confidential processing boundary.",
      confidentialProcessing: packageData.confidential_processing ?? (payload.campaign.tee_processing_enabled ? "Enabled" : "Disabled"),
      previewFields: (packageData.preview_fields ?? []).map((field: any) => ({
        field: field.field,
        status: field.status,
        previewValue: field.preview_value,
        transformation: field.transformation,
        eligibleForScoring: Boolean(field.eligible_for_scoring)
      }))
    },
    contributionPolicy: {
      contributionTypes: policyTypes.map((item: any) => ({
        type: item.type,
        benchmarkWeight: item.benchmark_weight,
        trustClass: item.trust_class,
        policyStatus: item.policy_status,
        explanation: item.explanation,
        attestationStatus: item.attestation_status
      })),
      eligibilityRules: (policyData.eligibility_rules ?? []).map((rule: any) => ({
        label: rule.label,
        status: rule.status
      })),
      submissionWeights: (policyData.submission_weights ?? []).map((item: any) => ({
        type: item.type,
        weight: item.weight,
        treatment: item.treatment
      })),
      qualityNote: policyData.quality_note ?? ""
    }
  };
}

function mapProcessingProjection(payload: any): ProcessingData {
  const run = payload.run;
  const evidenceRefs = payload.evidence_refs ?? [];
  const context = payload.processing_context ?? {};
  const contributionReceived = Boolean(context.contribution_received);
  const benchmarkReady = Boolean(context.benchmark_ready);
  const waitingSteps = [
    {
      label: "Run status",
      value: context.contribution_received ? "Contribution package received" : "Waiting for contribution",
      status: context.contribution_received ? "Received" : "Waiting",
      tone: context.contribution_received ? "warm" : "neutral",
      evidence: context.contribution_received ? "Prepared package submitted" : "No package received"
    },
    {
      label: "Contribution package received",
      value: context.contribution_received ? "Received" : "Not received",
      status: context.contribution_received ? "Received" : "Not received",
      tone: context.contribution_received ? "warm" : "neutral",
      evidence: context.contribution_status ?? "Not received"
    },
    {
      label: "Simulated TEE boundary",
      value: context.simulated_tee_status ?? "Standby",
      status: contributionReceived ? "Standby" : "Waiting",
      tone: contributionReceived ? "cool" : "neutral",
      evidence: "TEE-enabled confidential boundary simulation"
    },
    {
      label: "Policy checks",
      value: context.policy_checks ?? "Not started",
      status: context.policy_checks ?? "Not started",
      tone: contributionReceived ? "success" : "neutral",
      evidence: contributionReceived ? "Selected fields match campaign policy" : "Waiting for submitted package"
    },
    {
      label: "Raw data retention",
      value: context.retention ?? "None outside confidential boundary",
      status: "Enforced",
      tone: "success",
      evidence: "No raw package values exposed"
    },
    {
      label: "Benchmark readiness",
      value: context.benchmark_readiness ?? "Not ready",
      status: benchmarkReady ? "Ready" : "Not ready",
      tone: benchmarkReady ? "success" : "neutral",
      evidence: benchmarkReady ? "Derived benchmark output available" : "Waiting for benchmark release"
    }
  ];

  return {
    runId: run.id,
    status: run.run_status,
    metrics: payload.metrics ?? [],
    headline: run.run_status === "not_started" && !contributionReceived ? "Waiting for contribution package." : "Contribution package received.",
    body:
      context.safe_summary ??
      (run.run_status === "not_started"
        ? "Confidential processing has not started because Alpha Bank has not submitted its prepared contribution package yet."
        : "Compass uses confidential processing to ingest contribution fields inside a controlled environment, execute deterministic analytics, and return only derived benchmark intelligence plus institution-scoped outputs."),
    evidenceRefs,
    context: {
      campaignTitle: context.campaign_title,
      contributionType: context.contribution_type,
      contributionStatus: context.contribution_status,
      contributionReceived,
      simulatedTeeStatus: context.simulated_tee_status,
      policyChecks: context.policy_checks,
      benchmarkReadiness: context.benchmark_readiness,
      benchmarkReady,
      rawDataExposure: context.raw_data_exposure,
      retention: context.retention,
      attestationRef: context.attestation_ref,
      safeSummary: context.safe_summary,
      disclosureSummary: context.disclosure_summary,
      releasedScope: context.released_scope
    },
    steps: run.run_status === "not_started"
      ? waitingSteps
      : [
          { label: "Run status", value: titleCase(run.run_status), status: benchmarkReady ? "Ready" : titleCase(run.run_status), tone: benchmarkReady ? "success" : "cool", evidence: titleCase(run.run_status) },
          { label: "Contribution package received", value: `${run.input_count} selected contribution packages accepted`, status: "Received", tone: "warm", evidence: context.contribution_status ?? "Received" },
          { label: "Simulated TEE boundary", value: titleCase(run.runtime_mode), status: "Completed", tone: "success", evidence: "TEE-enabled confidential boundary simulation" },
          { label: "Policy checks", value: context.policy_checks ?? "Passed", status: context.policy_checks ?? "Passed", tone: "success", evidence: "Selected fields match campaign policy" },
          { label: "Raw data retention", value: "None outside confidential boundary", status: "Enforced", tone: "success", evidence: titleCase(run.retention_policy_status) },
          { label: "Benchmark readiness", value: context.benchmark_readiness ?? "Ready", status: benchmarkReady ? "Ready" : "Not ready", tone: benchmarkReady ? "success" : "neutral", evidence: payload.lifecycle?.[3] ?? "Institution outputs generated" },
          { label: "Attestation reference", value: run.attestation_ref ?? evidenceRefs[0] ?? context.attestation_ref ?? "ATT-SIM-0001", status: "Issued", tone: "warm", evidence: run.attestation_ref ?? context.attestation_ref ?? "ATT-SIM-0001" }
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
  requestedFields: string[],
  previewFields: NonNullable<CampaignData["contributionPackage"]>["previewFields"] = []
): Promise<CommandResult> {
  const previewMap = new Map(previewFields.map((field) => [field.field, field.previewValue]));
  const payload = Object.fromEntries(requestedFields.map((field) => [field, previewMap.get(field) ?? "Prepared policy field"]));

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
