import { useEffect, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import { ViewState } from "../../../components/primitives/ViewState";
import type { NavKey, ProcessingData } from "../../../data/types";
import { useDeskProcessing } from "../hooks";

interface DeskProcessingViewProps {
  data: ProcessingData;
  onNavigate: (key: NavKey) => void;
}

export function DeskProcessingView({ data: initialData, onNavigate }: DeskProcessingViewProps) {
  const result = useDeskProcessing(initialData);
  const [attestationOpen, setAttestationOpen] = useState(false);

  const data = result.data ?? initialData;
  const context = data.context;
  const contributionReceived = Boolean(context?.contributionReceived);
  const benchmarkReady = Boolean(context?.benchmarkReady);
  const primaryLabel = contributionReceived ? "View Attestation Record" : "Submit Contribution";
  const handlePrimaryAction = () => {
    if (contributionReceived) {
      setAttestationOpen(true);
      return;
    }

    onNavigate("campaign");
  };

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("compass:processing-action-label", {
        detail: { label: primaryLabel }
      })
    );
  }, [primaryLabel]);

  useEffect(() => {
    const handleTopBarAction = () => handlePrimaryAction();

    window.addEventListener("compass:processing-primary-action", handleTopBarAction);
    return () => window.removeEventListener("compass:processing-primary-action", handleTopBarAction);
  }, [contributionReceived]);

  if (result.status !== "ready" || !result.data) {
    return <ViewState result={result} title="Institution Desk Processing">{() => null}</ViewState>;
  }

  const boundarySummary = [
    { label: "Processing Status", value: contributionReceived ? "Package received" : data.metrics?.find((item) => item.label === "Run Status")?.value ?? "Waiting for contribution" },
    { label: "Contribution Package Received", value: contributionReceived ? "Received" : "Not received" },
    { label: "Simulated TEE Boundary", value: context?.simulatedTeeStatus ?? "Standby / waiting" },
    { label: "Policy Checks", value: context?.policyChecks ?? "Not started" },
    { label: "Benchmark Readiness", value: context?.benchmarkReadiness ?? "Not ready" },
    { label: "Raw Data Exposure", value: context?.rawDataExposure ?? "None" }
  ];
  const runtimeGuarantees = [
    {
      title: "Simulated TEE Boundary",
      body: context?.safeSummary ?? "Selected contribution fields are processed inside a simulated TEE confidential boundary before derived benchmark outputs are released."
    },
    {
      title: "TEE Simulation Status",
      body: context?.simulatedTeeStatus ?? "Standby - waiting for contribution"
    },
    {
      title: "Disclosure Boundary",
      body: context?.disclosureSummary ?? "Raw package values are not exposed in Institution Desk, Operator, Auditor, or peer benchmark views."
    },
    {
      title: "Retention Policy",
      body: context?.retention ?? "None outside confidential boundary"
    }
  ];
  const releasedOutputs = [
    context?.releasedScope ?? "Only derived benchmark metrics, institution-scoped outputs, and attestation references are released.",
    "Benchmark reliability package when ready",
    "Cohort-level benchmark metrics when ready",
    "Institution-scoped comparison output when ready",
    "No raw institutional contribution data"
  ];
  const realProcessingFlow = data.steps.map((step) => ({
    title: step.label,
    explanation: step.value,
    status: step.status ?? "Waiting",
    tone: step.tone ?? "neutral",
    evidence: step.evidence ?? step.value
  }));

  return (
    <div className="page-grid">
      <SectionCard title="Benchmark Boundary Summary" subtitle={data.headline}>
        <div className="processing-boundary-summary">
          <p>{data.body}</p>
          <div className="boundary-card-grid">
            {boundarySummary.map((item) => (
              <div key={item.label} className="boundary-mini-card">
                <span className="eyebrow">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Desk Actions" subtitle="Institution Desk can view safe status, review the contribution package, and continue only when benchmark intelligence is ready.">
        <div className="processing-action-row">
          <button type="button" className="record-button" onClick={() => onNavigate("campaign")}>
            {contributionReceived ? "View Contribution Package" : "Submit Contribution"}
          </button>
          <button type="button" className="record-button" onClick={() => setAttestationOpen(true)} disabled={!contributionReceived}>
            View Attestation Record
          </button>
          <button type="button" className="record-button" onClick={() => onNavigate("benchmark")} disabled={!benchmarkReady}>
            Continue to Benchmark
          </button>
          <button type="button" className="record-button" onClick={() => void result.refresh()} disabled={result.refreshStatus === "loading"}>
            {result.refreshStatus === "loading" ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>
        {result.refreshStatus === "error" && result.refreshMessage ? (
          <div className="role-state-panel role-state-panel--error">{result.refreshMessage}</div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Confidential Processing Flow"
        subtitle="Selected contribution fields are processed inside a simulated TEE confidential boundary before derived benchmark outputs are released."
      >
        <div className="processing-flow-list">
          {realProcessingFlow.map((step, index) => (
            <article key={step.title} className="processing-flow-row">
              <div className="processing-flow-row__index">0{index + 1}</div>
              <div className="processing-flow-row__main">
                <h3>{step.title}</h3>
                <p>{step.explanation}</p>
              </div>
              <div className="processing-flow-row__meta">
                <span className={`processing-status-badge processing-status-badge--${step.tone}`}>
                  {step.status}
                </span>
                <span>{step.evidence}</span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Runtime Guarantees">
        <div className="runtime-guarantee-grid">
          {runtimeGuarantees.map((guarantee) => (
            <article key={guarantee.title} className="runtime-guarantee-card">
              <span className="eyebrow">{guarantee.title}</span>
              <p>{guarantee.body}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Released Output Scope">
        <div className="released-output-list">
          {releasedOutputs.map((item) => (
            <div
              key={item}
              className={
                item === "No raw institutional contribution data"
                  ? "released-output-item released-output-item--critical"
                  : "released-output-item"
              }
            >
              <span aria-hidden="true" />
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </SectionCard>

      {attestationOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="confirmation-modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attestation-record-title"
          >
            <div className="confirmation-modal__header">
              <span className="eyebrow">Safe Attestation Summary</span>
              <h3 id="attestation-record-title">View Attestation Record</h3>
              <p>No raw contribution package values are exposed in this Institution Desk summary.</p>
            </div>
            <div className="confirmation-summary">
              <div>
                <span>Campaign</span>
                <strong>{context?.campaignTitle ?? "Q2 Repo Liquidity and Treasury Readiness Campaign"}</strong>
              </div>
              <div>
                <span>Contribution Type</span>
                <strong>{context?.contributionType ?? "System-signed"}</strong>
              </div>
              <div>
                <span>Contribution Status</span>
                <strong>{context?.contributionStatus ?? "Not received"}</strong>
              </div>
              <div>
                <span>Simulated TEE Status</span>
                <strong>{context?.simulatedTeeStatus ?? "Standby"}</strong>
              </div>
              <div>
                <span>Policy Checks</span>
                <strong>{context?.policyChecks ?? "Not started"}</strong>
              </div>
              <div>
                <span>Raw Data Exposure</span>
                <strong>{context?.rawDataExposure ?? "None"}</strong>
              </div>
              <div>
                <span>Retention</span>
                <strong>{context?.retention ?? "None outside confidential boundary"}</strong>
              </div>
              <div>
                <span>Reference</span>
                <strong>{context?.attestationRef ?? "ATT-SIM-0001"}</strong>
              </div>
            </div>
            <div className="confirmation-modal__actions">
              <button type="button" className="topbar-button topbar-button--primary" onClick={() => setAttestationOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

