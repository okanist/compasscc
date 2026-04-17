import type { ApiPayload } from "./types";

export const fallbackData: ApiPayload = {
  overview: {
    kpis: [
      { label: "Total Contributors", value: "28" },
      { label: "Attested Contributors", value: "19" },
      { label: "Benchmark Reliability", value: "91.4%", tone: "positive" },
      { label: "Active Intelligence Campaigns", value: "3" },
      { label: "Network Liquidity Status", value: "Stable" },
      { label: "Dispersion Level", value: "Elevated", tone: "warning" },
      { label: "Incentive Status", value: "Reward Window Open", tone: "positive" }
    ],
    informationBand: {
      title: "Privacy-Preserving Institutional Contribution",
      body: "Institutions contribute selected fields under policy. Raw positions never leave the confidential boundary. Only aggregate benchmarks and institution-scoped comparisons are produced."
    },
    processStrip: [
      "Private Contribution",
      "Confidential Processing",
      "Trust-Weighted Benchmark",
      "Position Intelligence",
      "Auditable Output"
    ]
  },
  campaigns: [
    {
      title: "Q2 Repo Liquidity and Treasury Readiness Campaign",
      scenario: "Tier-1 Canton treasury desks with active repo settlement flows",
      requestedFields: [
        "repo notional range",
        "secured funding rate",
        "collateral concentration",
        "average maturity bucket",
        "liquidity buffer ratio"
      ],
      minimumReputationThreshold: "0.78 network trust score",
      contributionReward: "Benchmark access uplift + campaign incentive credit",
      contributionTypes: [
        "Self-reported",
        "System-signed",
        "Oracle / custodian-attested"
      ],
      policySummary: "System-signed and custodian-attested submissions receive higher benchmark weight than self-reported entries. Out-of-policy contributions are excluded from final reliability scoring.",
      participationStatus: "Submitted and awaiting operator validation",
      contributorQualityTier: "Tier A-",
      confidenceTier: "High",
      teeProcessingEnabled: "Yes"
    }
  ],
  processing: {
    headline: "Raw data goes in. Only intelligence comes out.",
    body: "Compass uses confidential processing to ingest contribution fields inside a controlled environment, execute deterministic analytics, and return only derived benchmark intelligence plus institution-scoped outputs.",
    steps: [
      { label: "Raw institutional data received", value: "Selected contribution fields accepted under campaign policy" },
      { label: "Processed inside confidential environment", value: "TEE-enabled execution boundary" },
      { label: "Persistent storage disabled", value: "No raw payload persistence outside runtime" },
      { label: "Deterministic engine executed", value: "Benchmark, reliability, and dispersion metrics computed" },
      { label: "Local explainer enabled", value: "Summary layer restates computed outputs only" },
      { label: "Derived outputs generated", value: "Benchmark package and institution-scoped comparison" },
      { label: "Attestation reference", value: "TEE-ATTEST-Q2-REPONET-014" },
      { label: "Raw data retention", value: "None" }
    ]
  },
  benchmark: {
    scenarioOptions: ["Repo", "Treasury", "Repo with Treasury Collateral"],
    selectedScenario: "Repo with Treasury Collateral",
    primaryMetrics: [
      { label: "Average Liquidity", value: "73.8 / 100" },
      { label: "Average Repo Rate", value: "4.84%" },
      { label: "Average Haircut", value: "2.9%" },
      { label: "Aggregate Notional", value: "$1.42B" },
      { label: "Contributor Count", value: "24" },
      { label: "Trust-Weighted Benchmark Score", value: "88.6" },
      { label: "Liquidity Dispersion", value: "12.4 pts" },
      { label: "Benchmark Reliability", value: "91.4%" }
    ],
    secondaryMetrics: [
      { label: "Average Maturity", value: "11.2 days" },
      { label: "Treasury Yield Context", value: "4.37% UST proxy" },
      { label: "Duration Proxy", value: "0.19" },
      { label: "Yield Dispersion", value: "41 bps" }
    ],
    alerts: ["LIQUIDITY_OK", "ELEVATED_DISPERSION", "HAIRCUT_STRESS_SIGNAL"]
  },
  position: {
    metrics: [
      { label: "My Liquidity Score", value: "69.1 / 100" },
      { label: "Network Average", value: "73.8 / 100" },
      { label: "Delta vs Benchmark", value: "-4.7 pts" },
      { label: "Risk Tier", value: "Contained Watch" },
      { label: "Confidence Level", value: "High" },
      { label: "Collateral Structure", value: "UST-heavy with concentrated tenor" },
      { label: "Maturity Bucket", value: "8-14 days" }
    ],
    suggestedInterpretation: "The desk remains within acceptable network liquidity bounds, but funding efficiency trails peers under mixed repo and treasury collateral conditions.",
    explainableSummary: "Deterministic analytics place Alpha Bank modestly below the network benchmark because liquidity coverage and collateral diversification are weaker than the current trust-weighted cohort median. The explanation layer is restating the computed delta and reliability context for audit handoff."
  },
  explainableSummary: {
    text: "Alpha Bank is below the current trust-weighted liquidity benchmark by 4.7 points. Reliability is high because the active cohort contains a strong share of attested contributions. The summary is generated from deterministic benchmark outputs and is intended for local review and audit handoff."
  }
};

