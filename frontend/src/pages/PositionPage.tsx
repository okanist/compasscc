import { MetricRow } from "../components/MetricRow";
import { SectionCard } from "../components/SectionCard";
import type { PositionData } from "../data/types";

interface PositionPageProps {
  data: PositionData;
}

export function PositionPage({ data }: PositionPageProps) {
  return (
    <div className="page-grid">
      <SectionCard
        title="Institution Metrics"
        subtitle="Institution-scoped comparison for local decision support and audit handoff."
      >
        <div className="metric-list">
          {data.metrics.map((metric) => (
            <MetricRow key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Suggested Interpretation">
        <p>{data.suggestedInterpretation}</p>
      </SectionCard>

      <SectionCard title="Explainable Summary">
        <p>{data.explainableSummary}</p>
        <p className="section-note">
          Deterministic analytics compute the scores and alerts. A local explanation layer may restate those
          results for audit handoff and it is not an autonomous advisor.
        </p>
        <button type="button" className="record-button">
          Record to Canton
        </button>
      </SectionCard>
    </div>
  );
}

