import { MetricRow } from "../components/MetricRow";
import { SectionCard } from "../components/SectionCard";
import type { ProcessingData } from "../data/types";

interface ProcessingPageProps {
  data: ProcessingData;
}

export function ProcessingPage({ data }: ProcessingPageProps) {
  return (
    <div className="page-grid">
      <SectionCard title="Benchmark Boundary Summary" subtitle={data.headline}>
        <p>{data.body}</p>
      </SectionCard>

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

