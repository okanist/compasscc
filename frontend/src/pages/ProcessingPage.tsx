import { MetricRow } from "../components/MetricRow";
import { SectionCard } from "../components/SectionCard";
import type { ProcessingData } from "../data/types";

interface ProcessingPageProps {
  data: ProcessingData;
}

export function ProcessingPage({ data }: ProcessingPageProps) {
  return (
    <div className="page-grid">
      <section className="hero-panel panel">
        <span className="eyebrow">Confidential Processing</span>
        <h2>{data.headline}</h2>
        <p>{data.body}</p>
      </section>

      <SectionCard title="Confidential Compute Status" subtitle="Deterministic processing inside a confidential boundary.">
        <div className="metric-list">
          {data.steps.map((step) => (
            <MetricRow key={step.label} label={step.label} value={step.value} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

