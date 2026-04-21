import { useState } from "react";
import { SectionCard } from "../components/SectionCard";
import type { CampaignData } from "../data/types";

interface ContributionPageProps {
  data: CampaignData;
}

const contributionImpact = {
  "Self-reported": {
    benchmarkWeight: "Standard",
    trustClass: "Declared Institutional Input",
    policyStatus: "Accepted for review with limited reliability weighting",
    explanation:
      "This submission can support cohort visibility, but carries lower benchmark weight until stronger verification is available."
  },
  "System-signed": {
    benchmarkWeight: "Elevated",
    trustClass: "Verified Operational Input",
    policyStatus: "Eligible for final benchmark scoring",
    explanation:
      "This submission type contributes more strongly to the final benchmark than self-reported entries and improves cohort reliability when policy requirements are satisfied."
  },
  "Oracle / custodian-attested": {
    benchmarkWeight: "Highest",
    trustClass: "Externally Attested Input",
    policyStatus: "Eligible for maximum attestation treatment",
    explanation:
      "This submission receives the strongest benchmark treatment when external attestation aligns with active campaign policy."
  }
} as const;

const eligibilityRules = [
  { label: "Contribution matches active campaign field requirements", status: "Satisfied" },
  { label: "Minimum reputation threshold satisfied", status: "Satisfied" },
  { label: "Submission falls within attestation window", status: "Satisfied" },
  { label: "Confidence tier meets benchmark policy", status: "Satisfied" },
  { label: "Confidential processing enabled", status: "Satisfied" },
  { label: "No raw data retention outside secure boundary", status: "Enforced" }
];

const submissionWeights = [
  {
    type: "Self-reported",
    weight: "Standard",
    treatment: "Lower confidence contribution"
  },
  {
    type: "System-signed",
    weight: "Elevated",
    treatment: "Strong benchmark inclusion"
  },
  {
    type: "Oracle / custodian-attested",
    weight: "Highest",
    treatment: "Maximum attestation strength"
  }
];

export function ContributionPage({ data }: ContributionPageProps) {
  const [selectedType, setSelectedType] = useState<keyof typeof contributionImpact>("System-signed");
  const selectedImpact = contributionImpact[selectedType];
  const availableContributionTypes = data.contributionTypes.filter(
    (type): type is keyof typeof contributionImpact => type in contributionImpact
  );
  const contributionTypes =
    availableContributionTypes.length > 0
      ? availableContributionTypes
      : (Object.keys(contributionImpact) as Array<keyof typeof contributionImpact>);

  return (
    <div className="page-grid">
      <SectionCard
        title="Campaign Parameters"
        subtitle="Institutions contribute selected data under policy, and contribution quality directly affects benchmark strength."
      >
        <div className="details-grid">
          <div className="metric-block">
            <span className="eyebrow">Campaign Title</span>
            <strong>{data.title}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Scenario / Cohort</span>
            <strong>{data.scenario}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Minimum Reputation Threshold</span>
            <strong>{data.minimumReputationThreshold}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Contribution Reward</span>
            <strong>{data.contributionReward}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Participation Status</span>
            <strong>{data.participationStatus}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Contributor Quality Tier</span>
            <strong>{data.contributorQualityTier}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Confidence Tier</span>
            <strong>{data.confidenceTier}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">TEE Processing Enabled</span>
            <strong>{data.teeProcessingEnabled}</strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Requested Fields">
        <div className="tag-list">
          {data.requestedFields.map((field) => (
            <span key={field} className="tag">
              {field}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Contribution Types"
        subtitle="Choose the assurance class for this submission. Higher-assurance contribution types receive stronger benchmark weighting and reliability treatment."
      >
        <div className="contribution-policy-flow">
          <div className="assurance-selector" role="group" aria-label="Contribution assurance class">
            {contributionTypes.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  item === selectedType
                    ? "assurance-option assurance-option--selected"
                    : "assurance-option"
                }
                onClick={() => setSelectedType(item)}
                aria-pressed={item === selectedType}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>

          <div className="selected-impact-band" aria-live="polite">
            <div className="selected-impact-band__header">
              <span className="eyebrow">Selected Contribution Impact</span>
              <strong>{selectedType}</strong>
            </div>
            <div className="impact-metrics">
              <div>
                <span>Benchmark Weight</span>
                <strong>{selectedImpact.benchmarkWeight}</strong>
              </div>
              <div>
                <span>Trust Class</span>
                <strong>{selectedImpact.trustClass}</strong>
              </div>
              <div>
                <span>Policy Status</span>
                <strong>{selectedImpact.policyStatus}</strong>
              </div>
            </div>
            <p>{selectedImpact.explanation}</p>
          </div>

          <div className="policy-workflow-grid">
            <section className="policy-subsection" aria-labelledby="eligibility-rules-title">
              <div className="policy-subsection__header">
                <div>
                  <span className="eyebrow">Eligibility Rules</span>
                  <h3 id="eligibility-rules-title">Benchmark inclusion checks</h3>
                </div>
              </div>
              <div className="eligibility-list">
                {eligibilityRules.map((rule) => (
                  <div key={rule.label} className="eligibility-row">
                    <span className="eligibility-row__indicator" aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="presentation">
                        <path
                          d="m6.5 12.5 3.2 3.2 7.8-8.4"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.9"
                        />
                      </svg>
                    </span>
                    <span>{rule.label}</span>
                    <strong>{rule.status}</strong>
                  </div>
                ))}
              </div>
            </section>

            <aside className="policy-subsection policy-subsection--summary" aria-labelledby="policy-summary-title">
              <span className="eyebrow">Contribution Policy Summary</span>
              <h3 id="policy-summary-title">Benchmark inclusion logic</h3>
              <p>
                Benchmark inclusion depends on both submission type and policy compliance.
                System-signed and custodian-attested inputs receive higher benchmark weight than
                self-reported entries. Out-of-policy contributions may be accepted for review but
                excluded from final reliability scoring.
              </p>
            </aside>
          </div>

          <section className="policy-subsection" aria-labelledby="benchmark-weight-title">
            <div className="policy-subsection__header">
              <div>
                <span className="eyebrow">Benchmark Weight by Submission Type</span>
                <h3 id="benchmark-weight-title">Why assurance class matters</h3>
              </div>
            </div>
            <div className="weight-comparison">
              {submissionWeights.map((item) => (
                <div
                  key={item.type}
                  className={
                    item.type === selectedType
                      ? "weight-row weight-row--selected"
                      : "weight-row"
                  }
                >
                  <strong>{item.type}</strong>
                  <span>{item.weight}</span>
                  <p>{item.treatment}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="quality-note">
            <span className="eyebrow">Why Contribution Quality Matters</span>
            <p>
              Compass does not treat all institutional submissions as equally trustworthy.
              Contribution quality directly affects benchmark strength, attestation coverage, and
              the confidence of institution-level intelligence outputs.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

