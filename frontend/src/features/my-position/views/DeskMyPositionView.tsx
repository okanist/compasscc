import { useEffect, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import { ViewState } from "../../../components/primitives/ViewState";
import type { NavKey, PositionData } from "../../../data/types";
import { useDeskMyPosition } from "../hooks";

interface DeskMyPositionViewProps {
  data: PositionData;
  onNavigate: (key: NavKey) => void;
}

const featuredOutputs = [
  "My Liquidity Score",
  "Network Average",
  "Delta vs Benchmark",
  "Risk Tier"
];

const metricOrder = [
  "My Liquidity Score",
  "Network Average",
  "Delta vs Benchmark",
  "Risk Tier",
  "Confidence Level",
  "Collateral Structure",
  "Maturity Bucket"
];

const defaultRecommendedActions = [
  {
    title: "Review collateral concentration",
    body: "Assess concentration in treasury-heavy collateral profiles against active cohort behavior."
  },
  {
    title: "Assess maturity distribution",
    body: "Review 8-14 day exposure and evaluate flexibility under mixed repo settlement conditions."
  },
  {
    title: "Record benchmark comparison",
    body: "Capture the institution-scoped output package for audit-linked review and follow-up."
  }
];

export function DeskMyPositionView({ data: initialData, onNavigate }: DeskMyPositionViewProps) {
  const result = useDeskMyPosition(initialData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const data = result.data ?? initialData;
  const outputReady = Boolean(data.context?.outputReady);
  const alreadyRecorded = data.recordStatus === "finalized";
  const recordable = Boolean(data.context?.recordable && data.outputId && !alreadyRecorded);

  const openRecordConfirmation = () => {
    if (!outputReady) {
      onNavigate("benchmark");
      return;
    }

    if (!recordable) {
      return;
    }

    setConfirmOpen(true);
  };

  useEffect(() => {
    const handleTopBarAction = () => openRecordConfirmation();

    window.addEventListener("compass:position-primary-action", handleTopBarAction);
    return () => window.removeEventListener("compass:position-primary-action", handleTopBarAction);
  }, [outputReady, recordable, data.outputId]);

  if (result.status !== "ready" || !result.data) {
    return <ViewState result={result} title="Institution Desk Position">{() => null}</ViewState>;
  }

  if (!outputReady) {
    return (
      <div className="page-grid position-page">
        <SectionCard
          title="Institution Position Output Is Not Ready Yet"
          subtitle="Alpha Bank's institution-scoped comparison becomes available after contribution submission and benchmark readiness."
        >
          <div className="role-state-panel">
            {data.context?.notReadyMessage ??
              "The contribution package must be submitted and benchmark intelligence must be ready before this scoped comparison is released."}
          </div>
          <div className="processing-action-row">
            <button type="button" className="record-button" onClick={() => onNavigate("campaign")}>
              View Contribution Package
            </button>
            <button type="button" className="record-button" onClick={() => onNavigate("processing")}>
              View Processing Status
            </button>
            <button type="button" className="record-button" onClick={() => onNavigate("benchmark")}>
              View Benchmark Intelligence
            </button>
            <button type="button" className="record-button" onClick={() => void result.refresh()}>
              Refresh Status
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  const metricMap = new Map(data.metrics.map((metric) => [metric.label, metric.value]));
  const recommendedActions = data.recommendedActions?.length ? data.recommendedActions : defaultRecommendedActions;
  const recordLabel =
    result.recordStatus === "recording"
      ? "Recording..."
      : alreadyRecorded
        ? "Recorded to Canton"
        : "Record to Canton";
  const handleConfirmRecord = async () => {
    await result.record();
    setConfirmOpen(false);
  };

  return (
    <div className="page-grid position-page">
      <SectionCard title="Institution Signal Summary">
        <div className="position-signal-card">
          <div className="position-context-strip">
            <span>Institution-scoped comparison</span>
            <span>{data.context?.institutionName ?? "Alpha Bank"}</span>
            <span>{data.context?.selectedScenario ?? "Active scenario"}</span>
            <span>{data.context?.benchmarkReference ?? "Benchmark reference pending"}</span>
          </div>
          <p className="position-signal-card__lead">
            {data.suggestedInterpretation}
          </p>
          <div className="position-feature-grid">
            {featuredOutputs.map((label) => (
              <article
                key={label}
                className={
                  label === "Delta vs Benchmark" || label === "Risk Tier"
                    ? "position-feature-card position-feature-card--watch"
                    : "position-feature-card"
                }
              >
                <span className="eyebrow">{label}</span>
                <strong>{metricMap.get(label)}</strong>
              </article>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Institution Metrics">
        <div className="position-metric-grid">
          {metricOrder.map((label) => (
            <div
              key={label}
              className={
                label === "Delta vs Benchmark" || label === "Risk Tier"
                  ? "position-metric-card position-metric-card--prominent"
                  : "position-metric-card"
              }
            >
              <span>{label}</span>
              <strong>{metricMap.get(label)}</strong>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Position vs Benchmark">
        <div className="position-band-panel">
          <div className="position-band-copy">
            <span className="eyebrow">Benchmark-relative position</span>
            <strong>{metricMap.get("Delta vs Benchmark")}</strong>
          <p>
              {data.suggestedInterpretation}
            </p>
          </div>
          <div className="position-band-visual" aria-label="Position versus benchmark range">
            <div className="position-band-track">
              <span className="position-band-segment position-band-segment--lower" />
              <span className="position-band-segment position-band-segment--median" />
              <span className="position-band-segment position-band-segment--upper" />
              <span className="position-band-marker position-band-marker--mine">
                <strong>My position</strong>
              </span>
              <span className="position-band-marker position-band-marker--network">
                <strong>Network benchmark</strong>
              </span>
            </div>
            <div className="position-band-labels">
              <span>Lower band</span>
              <span>Median</span>
              <span>Upper band</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Suggested Interpretation">
        <div className="position-interpretation-card">
          <p>{data.suggestedInterpretation}</p>
          <div className="position-interpretation-lines">
            {[
              `Alpha Bank score: ${metricMap.get("My Liquidity Score") ?? "N/A"}`,
              `Cohort benchmark: ${metricMap.get("Network Average") ?? "N/A"}`,
              `Risk tier: ${metricMap.get("Risk Tier") ?? "N/A"}`
            ].map((line, index) => (
              <span
                key={line}
                className={index === 0 ? "position-interpretation-line--primary" : undefined}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Explainable Summary">
        <div className="position-explain-card">
          <p>{data.explainableSummary}</p>
          <div className="position-explain-grid">
            {[
              data.context?.privacySummary ?? "Outputs are derived from anonymized benchmark computation and Alpha Bank's scoped comparison package.",
              "Raw Alpha Bank contribution fields and raw peer positions are not shown.",
              "Canton-style recording captures the institution-scoped output lifecycle."
            ].map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Recommended Actions">
        <div className="position-action-grid">
          {recommendedActions.map((action) => (
            <article key={action.title} className="position-action-card">
              <span className="eyebrow">{action.title}</span>
              <p>{action.body}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Audit Handoff"
        subtitle="Institution-scoped comparison package is ready for audit-linked recording and internal review."
      >
        <div className="position-audit-panel">
          <div className="position-audit-summary">
            <div className="position-audit-status">
              <span className="eyebrow">Record Lifecycle</span>
              <strong>{data.recordStatus ?? "draft"}</strong>
              <p>{data.cantonRecordRef ? "Canton-style record reference finalized." : "Ready for simulated Canton recording."}</p>
            </div>
            <div className="position-audit-details">
              <span>Benchmark snapshot reference available</span>
              <span>Institution-scoped output package ready</span>
              <span>Attestation-linked summary available</span>
              <span>Raw data exposure: none</span>
            </div>
            {data.cantonRecordRef ? (
              <div className="position-audit-reference">
                <span className="eyebrow">Canton-style record reference</span>
                <strong>{data.cantonRecordRef}</strong>
                {data.context?.recordedAt ? <p>Finalized at {data.context.recordedAt}</p> : null}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="record-button position-audit-button"
            onClick={openRecordConfirmation}
            disabled={result.recordStatus === "recording" || !recordable}
          >
            {recordLabel}
          </button>
        </div>
        {result.recordMessage ? (
          <div
            className={
              result.recordStatus === "error"
                ? "position-audit-message position-audit-message--error"
                : "position-audit-message"
            }
          >
            {result.recordMessage}
            {data.cantonRecordRef ? ` Reference: ${data.cantonRecordRef}` : ""}
          </div>
        ) : null}
      </SectionCard>

      {confirmOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="confirmation-modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="position-record-title"
          >
            <div className="confirmation-modal__header">
              <span className="eyebrow">Record to Canton</span>
              <h3 id="position-record-title">Confirm Institution-Scoped Record</h3>
              <p>
                This creates a Canton-style record reference for the derived Alpha Bank comparison output.
                Raw contribution values remain outside the record.
              </p>
            </div>
            <div className="confirmation-summary">
              <div>
                <span>Institution</span>
                <strong>{data.context?.institutionName ?? "Alpha Bank"}</strong>
              </div>
              <div>
                <span>Scenario</span>
                <strong>{data.context?.selectedScenario ?? "Active scenario"}</strong>
              </div>
              <div>
                <span>Benchmark Reference</span>
                <strong>{data.context?.benchmarkReference ?? "Pending"}</strong>
              </div>
              <div>
                <span>Output ID</span>
                <strong>{data.outputId ?? "Pending"}</strong>
              </div>
              <div>
                <span>Record Lifecycle</span>
                <strong>{data.recordStatus ?? "draft"}</strong>
              </div>
              <div>
                <span>Raw Data Exposure</span>
                <strong>None</strong>
              </div>
            </div>
            <div className="confirmation-modal__actions">
              <button type="button" className="secondary-button" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="record-button" onClick={() => void handleConfirmRecord()} disabled={result.recordStatus === "recording"}>
                {result.recordStatus === "recording" ? "Recording..." : "Record to Canton"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
