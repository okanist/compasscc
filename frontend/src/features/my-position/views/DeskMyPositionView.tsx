import { SectionCard } from "../../../components/SectionCard";
import { ViewState } from "../../../components/primitives/ViewState";
import type { PositionData } from "../../../data/types";
import { useDeskMyPosition } from "../hooks";

interface DeskMyPositionViewProps {
  data: PositionData;
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

const interpretationLines = [
  "Liquidity score remains below cohort median.",
  "Collateral concentration reduces flexibility under stress.",
  "Confidence remains high due to attested benchmark reliability."
];

const explanationPoints = [
  "Computed from trust-weighted benchmark comparison",
  "Explanation layer restates derived outputs only",
  "Suitable for audit handoff and internal review"
];

const recommendedActions = [
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

const auditItems = [
  "Benchmark snapshot reference available",
  "Institution-scoped output package ready",
  "Attestation-linked summary available",
  "Record to Canton action"
];

export function DeskMyPositionView({ data: initialData }: DeskMyPositionViewProps) {
  const result = useDeskMyPosition(initialData);

  if (result.status !== "ready" || !result.data) {
    return <ViewState result={result} title="Institution Desk Position">{() => null}</ViewState>;
  }

  const data = result.data;
  const metricMap = new Map(data.metrics.map((metric) => [metric.label, metric.value]));

  return (
    <div className="page-grid position-page">
      <SectionCard title="Institution Signal Summary">
        <div className="position-signal-card">
          <p className="position-signal-card__lead">
            Alpha Bank remains within acceptable benchmark bounds, but underperforms the active cohort
            on liquidity efficiency and collateral diversification.
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
              Alpha Bank sits below the active network average while remaining inside acceptable
              benchmark bounds for the current cohort.
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
            {interpretationLines.map((line, index) => (
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
          <p>
            Deterministic benchmark comparison places Alpha Bank below the current trust-weighted
            cohort median. The explanation layer restates derived benchmark outputs for local review
            and audit handoff without accessing raw peer contribution data.
          </p>
          <div className="position-explain-grid">
            {explanationPoints.map((point) => (
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
          <div className="position-audit-list">
            {auditItems.map((item) => (
              <span key={item} className={item === "Record to Canton action" ? "position-audit-item--action" : undefined}>
                {item}
              </span>
            ))}
          </div>
          <button type="button" className="record-button position-audit-button">
            Record to Canton
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
