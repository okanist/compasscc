import { SectionCard } from "../../../components/SectionCard";
import { ViewState } from "../../../components/primitives/ViewState";
import type { ProcessingData } from "../../../data/types";
import { useDeskProcessing } from "../hooks";

interface DeskProcessingViewProps {
  data: ProcessingData;
}

const boundarySummary = [
  { label: "Input Scope", value: "Selected contribution fields only" },
  { label: "Processing Mode", value: "TEE-enabled deterministic runtime" },
  { label: "Output Scope", value: "Derived benchmark and scoped outputs" }
];

const processingFlow = [
  {
    title: "Raw contribution accepted",
    explanation: "Selected fields accepted under active campaign policy",
    status: "Accepted",
    tone: "warm",
    evidence: "Campaign policy matched"
  },
  {
    title: "Secure execution started",
    explanation: "Contribution package entered TEE-enabled runtime",
    status: "Active",
    tone: "cool",
    evidence: "Confidential boundary enabled"
  },
  {
    title: "Persistent storage disabled",
    explanation: "Raw payload retention blocked outside runtime",
    status: "Enforced",
    tone: "neutral",
    evidence: "No external persistence"
  },
  {
    title: "Deterministic benchmark engine executed",
    explanation: "Liquidity, reliability, and dispersion logic computed",
    status: "Completed",
    tone: "success",
    evidence: "Deterministic run successful"
  },
  {
    title: "Local explanation layer applied",
    explanation: "Summary restates computed results only",
    status: "Restricted",
    tone: "neutral",
    evidence: "No raw data access"
  },
  {
    title: "Derived output package generated",
    explanation: "Benchmark package and institution-scoped comparison produced",
    status: "Generated",
    tone: "warm",
    evidence: "Output scope verified"
  },
  {
    title: "Attestation reference created",
    explanation: "Audit-ready execution reference linked to this run",
    status: "Issued",
    tone: "warm",
    evidence: "TEE-ATTEST-Q2-REPONET-014"
  },
  {
    title: "Raw data retention policy enforced",
    explanation: "Raw data not retained outside secure execution path",
    status: "None",
    tone: "neutral",
    evidence: "Retention disabled"
  }
];

const runtimeGuarantees = [
  {
    title: "Confidential Boundary",
    body: "TEE-enabled execution boundary active"
  },
  {
    title: "Deterministic Logic",
    body: "Outputs generated from fixed computation paths"
  },
  {
    title: "Restricted Explanation Layer",
    body: "Summaries restate outputs without raw payload access"
  },
  {
    title: "Retention Policy",
    body: "No raw payload persistence outside runtime"
  }
];

const releasedOutputs = [
  "Benchmark reliability package",
  "Cohort-level benchmark metrics",
  "Institution-scoped comparison output",
  "Attestation reference",
  "No raw institutional contribution data"
];

export function DeskProcessingView({ data: initialData }: DeskProcessingViewProps) {
  const result = useDeskProcessing(initialData);

  if (result.status !== "ready" || !result.data) {
    return <ViewState result={result} title="Institution Desk Processing">{() => null}</ViewState>;
  }

  const data = result.data;
  const realProcessingFlow =
    data.steps.length > 0
      ? data.steps.map((step, index) => ({
          title: step.label,
          explanation: step.value,
          status:
            index === 0
              ? data.status ?? "active"
              : index >= data.steps.length - 2
                ? "Issued"
                : "Completed",
          tone: index === 0 ? "cool" : index >= data.steps.length - 2 ? "warm" : "success",
          evidence: data.evidenceRefs?.[index] ?? step.value
        }))
      : processingFlow;

  return (
    <div className="page-grid">
      <SectionCard title="Benchmark Boundary Summary" subtitle="Raw data goes in. Only intelligence comes out.">
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

      <SectionCard
        title="Confidential Processing Flow"
        subtitle="Each benchmark package is processed inside a controlled execution boundary before any derived output is released."
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
    </div>
  );
}

