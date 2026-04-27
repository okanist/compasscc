import { useCallback, useEffect, useRef, useState } from "react";
import { ViewState } from "../../../components/primitives/ViewState";
import { SectionCard } from "../../../components/SectionCard";
import type { CampaignData } from "../../../data/types";
import { useDeskContribute } from "../hooks";

interface DeskContributeViewProps {
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
  { label: "Contribution matches active campaign field requirements", status: "Matched" },
  { label: "Minimum reputation threshold satisfied", status: "Passed" },
  { label: "Submission falls within attestation window", status: "Valid" },
  { label: "Confidence tier meets benchmark policy", status: "Qualified" },
  { label: "Confidential processing enabled", status: "Active" },
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

export function DeskContributeView({ data: initialData }: DeskContributeViewProps) {
  const result = useDeskContribute(initialData);
  const [selectedType, setSelectedType] = useState<keyof typeof contributionImpact>("System-signed");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const packagePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backendType = result.data?.selectedContributionType;

    if (backendType && backendType in contributionImpact) {
      setSelectedType(backendType as keyof typeof contributionImpact);
    }
  }, [result.data?.selectedContributionType]);

  const handleConfirmSubmit = useCallback(async () => {
    setConfirmOpen(false);
    await result.submit(selectedType);
  }, [result, selectedType]);

  const data = result.data ?? initialData;
  const terminalSubmission = data.latestSubmissionStatus === "approved" || data.latestSubmissionStatus === "rejected";
  const openSubmission = data.latestSubmissionStatus === "submitted" || data.latestSubmissionStatus === "under_review";
  const submitLabel = result.submitStatus === "submitting"
    ? "Submitting..."
    : terminalSubmission
      ? "View Submitted Package"
      : openSubmission
        ? "Update Contribution Package"
        : "Submit Contribution";
  const handlePrimaryAction = useCallback(() => {
    if (terminalSubmission) {
      packagePreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setConfirmOpen(true);
  }, [terminalSubmission]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("compass:contribution-action-label", {
        detail: { label: submitLabel }
      })
    );
  }, [submitLabel]);

  useEffect(() => {
    const handleTopBarSubmit = () => {
      handlePrimaryAction();
    };

    window.addEventListener("compass:submit-contribution", handleTopBarSubmit);
    return () => window.removeEventListener("compass:submit-contribution", handleTopBarSubmit);
  }, [handlePrimaryAction]);

  if (result.status !== "ready" || !result.data) {
    return <ViewState result={result} title="Institution Desk Contribution">{() => null}</ViewState>;
  }

  const policyTypes = data.contributionPolicy?.contributionTypes ?? [];
  const policyImpact = policyTypes.find((item) => item.type === selectedType);
  const selectedImpact = policyImpact ?? contributionImpact[selectedType];
  const eligibilityRules = data.contributionPolicy?.eligibilityRules ?? [];
  const submissionWeights = data.contributionPolicy?.submissionWeights ?? [];
  const previewFields = data.contributionPackage?.previewFields ?? [];
  const availableContributionTypes = data.contributionTypes.filter(
    (type): type is keyof typeof contributionImpact => type in contributionImpact
  );
  const contributionTypes =
    availableContributionTypes.length > 0
      ? availableContributionTypes
      : (Object.keys(contributionImpact) as Array<keyof typeof contributionImpact>);
  const confirmationActionLabel = openSubmission ? "Update Package" : "Submit Package";
  const fieldCount = previewFields.length || data.requestedFields.length;

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
            <span className="eyebrow">Confidential Processing Enabled</span>
            <strong>{data.teeProcessingEnabled}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Attestation Status</span>
            <strong>{data.attestationStatus ?? data.contributionPackage?.attestationStatus ?? "Pending"}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Raw Data Retention</span>
            <strong>{data.rawDataRetention ?? data.contributionPackage?.rawDataRetention ?? "None outside confidential boundary"}</strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Contribution Package / Submission Preview"
        subtitle="Alpha Bank reviews selected benchmark fields prepared for this campaign. Raw package values are masked, bucketed, normalized, or policy-transformed before confidential processing."
      >
        <div className="contribution-package-summary" ref={packagePreviewRef}>
          <div className="metric-block">
            <span className="eyebrow">Package Status</span>
            <strong>{data.contributionPackage?.status ?? data.participationStatus}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Selected Contribution Type</span>
            <strong>{selectedType}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Package Boundary</span>
            <strong>{data.contributionPackage?.rawDataRetention ?? "Raw values are not exposed outside confidential processing."}</strong>
          </div>
        </div>

        <div className="package-preview-grid" aria-label="Prepared contribution package preview">
          {(previewFields.length ? previewFields : data.requestedFields.map((field) => ({
            field,
            status: "Ready",
            previewValue: "Prepared policy field",
            transformation: "Masked / bucketed / normalized",
            eligibleForScoring: true
          }))).map((field) => (
            <article key={field.field} className="package-preview-card">
              <div>
                <span className="eyebrow">{field.status}</span>
                <h3>{field.field}</h3>
              </div>
              <strong>{field.previewValue}</strong>
              <p>{field.transformation}</p>
              <span className={field.eligibleForScoring ? "tag tag--accent" : "tag"}>
                {field.eligibleForScoring ? "Eligible for scoring" : "Review required"}
              </span>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Contribution Types"
        subtitle="Choose the policy assurance class sent with this demo package. External attestation classes are policy-recognized here; no live oracle or custodian connection is implied."
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
                disabled={terminalSubmission || result.submitStatus === "submitting"}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>

          <div className="selected-impact-band" aria-live="polite">
            <div className="selected-impact-band__header">
              <span className="eyebrow">Selected Contribution Impact</span>
              <span className="selected-impact-band__badge">{selectedType}</span>
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
                {(eligibilityRules.length ? eligibilityRules : [
                  { label: "Selected fields match active campaign requirements", status: "Matched" },
                  { label: "Contribution package uses selected benchmark fields only", status: "Passed" },
                  { label: "Raw data retention outside processing boundary", status: "None" }
                ]).map((rule) => (
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
              <p>{data.policySummary}</p>
              <div className="policy-rule-list" aria-label="Policy scoring rules">
                <span>Type affects weight</span>
                <span>Policy gates scoring</span>
                <span>Out-of-policy remains review-only until resolved</span>
              </div>
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
              {(submissionWeights.length ? submissionWeights : [
                { type: "Self-reported", weight: "Standard", treatment: "Lower confidence contribution" },
                { type: "System-signed", weight: "Elevated", treatment: "Strong benchmark inclusion after review" },
                { type: "Oracle / custodian-attested", weight: "Highest", treatment: "Maximum policy weight when external attestation is available" }
              ]).map((item) => (
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
            <div>
              <span className="eyebrow">Why Contribution Quality Matters</span>
              <p>{data.contributionPolicy?.qualityNote || "Contribution quality affects benchmark strength and confidence. The Institution Desk submits selected benchmark fields, not full raw institutional positions."}</p>
            </div>
          </div>

          {result.submitMessage ? (
            <div
              className={
                result.submitStatus === "error"
                  ? "contribution-status-panel contribution-status-panel--error"
                  : "contribution-status-panel contribution-status-panel--success"
              }
              role="status"
            >
              <span className="eyebrow">{result.submitStatus === "error" ? "Submission Error" : "Package Status"}</span>
              <strong>{result.submitMessage}</strong>
            </div>
          ) : null}

          <div className="contribution-submit-row">
            <button
              type="button"
              className="record-button"
              onClick={handlePrimaryAction}
              disabled={result.submitStatus === "submitting"}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </SectionCard>

      {confirmOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="confirmation-modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contribution-confirm-title"
          >
            <div className="confirmation-modal__header">
              <span className="eyebrow">Confirm Contribution Package</span>
              <h3 id="contribution-confirm-title">{confirmationActionLabel}</h3>
              <p>
                Confirm Alpha Bank's prepared benchmark contribution package before sending it for
                confidential processing.
              </p>
            </div>

            <div className="confirmation-summary">
              <div>
                <span>Campaign</span>
                <strong>{data.title}</strong>
              </div>
              <div>
                <span>Contribution Type</span>
                <strong>{selectedType}</strong>
              </div>
              <div>
                <span>Selected Benchmark Fields</span>
                <strong>{fieldCount}</strong>
              </div>
              <div>
                <span>Raw Data Exposure</span>
                <strong>None</strong>
              </div>
              <div>
                <span>Confidential Processing</span>
                <strong>{data.contributionPackage?.confidentialProcessing ?? data.teeProcessingEnabled}</strong>
              </div>
            </div>

            <div className="confirmation-modal__actions">
              <button type="button" className="topbar-button topbar-button--secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="topbar-button topbar-button--primary" onClick={handleConfirmSubmit}>
                {confirmationActionLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

