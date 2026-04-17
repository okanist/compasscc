export type Role = "Institution Desk" | "Operator" | "Regulator / Auditor";

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
}

export interface ProcessingData {
  steps: { label: string; value: string }[];
  headline: string;
  body: string;
}

export interface BenchmarkData {
  scenarioOptions: string[];
  selectedScenario: string;
  primaryMetrics: { label: string; value: string }[];
  secondaryMetrics: { label: string; value: string }[];
  alerts: string[];
}

export interface PositionData {
  metrics: { label: string; value: string }[];
  suggestedInterpretation: string;
  explainableSummary: string;
}

export interface ApiPayload {
  overview: OverviewData;
  campaigns: CampaignData[];
  processing: ProcessingData;
  benchmark: BenchmarkData;
  position: PositionData;
  explainableSummary: { text: string };
}

