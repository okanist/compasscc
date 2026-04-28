export type NavKey =
  | "overview"
  | "campaign"
  | "processing"
  | "benchmark"
  | "position";

export interface OverviewData {
  kpis: { label: string; value: string; detail?: string; tone?: "neutral" | "positive" | "warning" }[];
  informationBand: {
    title: string;
    body: string;
  };
  processStrip: string[];
  deskOverview?: {
    context?: {
      benchmarkReady?: boolean;
      nextAction?: "submit_contribution" | "view_benchmark";
      message?: string;
    };
    benchmark?: {
      title?: string;
      averageLiquidity?: string;
      delta?: string;
      topQuartile?: string;
      median?: string;
      bottomQuartile?: string;
      interpretation?: string;
    };
    networkIntelligence?: {
      subtitle?: string;
      eyebrow?: string;
      headline?: string;
      body?: string;
      route?: NavKey;
    };
    contributionCards?: {
      title: string;
      status: string;
      action: string;
      tone?: "success" | "action" | "ghost";
    }[];
    recentIntelligence?: {
      category?: string;
      title: string;
      meta?: string;
      route?: NavKey;
    }[];
  };
}

export interface CampaignData {
  id?: number;
  title: string;
  scenario: string;
  requestedFields: string[];
  minimumReputationThreshold: string;
  contributionReward: string;
  contributionTypes: string[];
  policySummary: string;
  participationStatus: string;
  contributorQualityTier: string;
  confidenceTier: string;
  teeProcessingEnabled: string;
  latestSubmissionStatus?: string;
  selectedContributionType?: string;
  attestationStatus?: string;
  rawDataRetention?: string;
  processingRunId?: number;
  contributionPackage?: {
    status: string;
    selectedType: string;
    confidenceTier: string;
    attestationStatus: string;
    rawDataRetention: string;
    confidentialProcessing: string;
    previewFields: {
      field: string;
      status: string;
      previewValue: string;
      transformation: string;
      eligibleForScoring: boolean;
    }[];
  };
  contributionPolicy?: {
    contributionTypes: {
      type: string;
      benchmarkWeight: string;
      trustClass: string;
      policyStatus: string;
      explanation: string;
      attestationStatus: string;
    }[];
    eligibilityRules: { label: string; status: string }[];
    submissionWeights: { type: string; weight: string; treatment: string }[];
    qualityNote: string;
  };
}

export interface ProcessingData {
  runId?: number;
  status?: string;
  metrics?: { label: string; value: string; detail?: string }[];
  steps: { label: string; value: string; status?: string; tone?: string; evidence?: string }[];
  headline: string;
  body: string;
  evidenceRefs?: string[];
  context?: {
    campaignTitle?: string;
    contributionType?: string;
    contributionStatus?: string;
    contributionReceived?: boolean;
    simulatedTeeStatus?: string;
    policyChecks?: string;
    benchmarkReadiness?: string;
    benchmarkReady?: boolean;
    nextAction?: "submit_contribution" | "view_benchmark";
    rawDataExposure?: string;
    retention?: string;
    attestationRef?: string;
    safeSummary?: string;
    disclosureSummary?: string;
    releasedScope?: string;
  };
}

export interface BenchmarkData {
  scenarioOptions: string[];
  selectedScenario: string;
  primaryMetrics: { label: string; value: string; detail?: string | null }[];
  secondaryMetrics: { label: string; value: string; detail?: string | null }[];
  alerts: string[];
  distribution?: {
    topQuartile?: number;
    median?: number;
    bottomQuartile?: number;
  };
  context?: {
    benchmarkReady?: boolean;
    nextAction?: "submit_contribution" | "view_benchmark";
    activeCohort?: string;
    attestedCoverage?: string;
    lastRefresh?: string;
    networkSignalSummary?: string;
    confidenceNotes?: string[];
    notReadyMessage?: string;
  };
}

export interface PositionData {
  outputId?: number;
  metrics: { label: string; value: string }[];
  suggestedInterpretation: string;
  explainableSummary: string;
  recommendedActions?: { title: string; body: string }[];
  auditHandoff?: string[];
  recordStatus?: string;
  cantonRecordRef?: string | null;
  context?: {
    outputReady?: boolean;
    recordable?: boolean;
    nextAction?: "submit_contribution" | "view_benchmark" | "record_to_canton";
    selectedScenario?: string;
    institutionName?: string;
    benchmarkReference?: string | null;
    recordLifecycle?: string;
    createdAt?: string;
    recordedAt?: string;
    privacySummary?: string;
    notReadyMessage?: string;
  };
}

export interface ApiPayload {
  overview: OverviewData;
  campaigns: CampaignData[];
  processing: ProcessingData;
  benchmark: BenchmarkData;
  position: PositionData;
  explainableSummary: { text: string };
}

export interface CommandResult {
  status: string;
  message: string;
  resource_id?: number | null;
  next_state?: string | null;
  related_resource_id?: number | null;
}

export interface OperatorPendingSubmission {
  id: number;
  campaign_id: number;
  institution_id: number;
  institution: string;
  submission_type: string;
  policy_status: string;
  review_status: string;
  attestation_status: string;
  confidence_tier: string;
  submitted_at?: string;
  updated_at?: string;
}

export interface AuditorAuditRecordData {
  metrics: { label: string; value: string; detail?: string }[];
  releaseScope: string[];
  evidenceRefs: string[];
  integrityNotes: string[];
  auditTrail: string[];
  context: {
    recordId?: number | null;
    recordLifecycle?: string;
    lifecycleMessage?: string;
    cantonRecordRef?: string | null;
    institution?: string;
    outputId?: number | null;
    benchmarkSnapshotReference?: string | null;
    runId?: number | null;
    releaseReference?: string | null;
    attestationReference?: string;
    retentionStatus?: string;
    rawDataExposure?: string;
    finalizedAt?: string | null;
    releaseReady?: boolean;
    finalized?: boolean;
  };
}

