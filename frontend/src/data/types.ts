export type NavKey =
  | "overview"
  | "campaign"
  | "processing"
  | "benchmark"
  | "position";

export interface OverviewData {
  kpis: { label: string; value: string; tone?: "neutral" | "positive" | "warning" }[];
  informationBand: {
    title: string;
    body: string;
  };
  processStrip: string[];
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
  processingRunId?: number;
}

export interface ProcessingData {
  runId?: number;
  status?: string;
  steps: { label: string; value: string }[];
  headline: string;
  body: string;
  evidenceRefs?: string[];
}

export interface BenchmarkData {
  scenarioOptions: string[];
  selectedScenario: string;
  primaryMetrics: { label: string; value: string }[];
  secondaryMetrics: { label: string; value: string }[];
  alerts: string[];
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
}

export interface AuditorAuditRecordData {
  metrics: { label: string; value: string; detail?: string }[];
  releaseScope: string[];
  evidenceRefs: string[];
  integrityNotes: string[];
}

