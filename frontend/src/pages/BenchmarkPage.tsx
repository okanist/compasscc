import { useState } from "react";
import { MetricRow } from "../components/MetricRow";
import { SectionCard } from "../components/SectionCard";
import type { BenchmarkData } from "../data/types";

interface BenchmarkPageProps {
  data: BenchmarkData;
}

export function BenchmarkPage({ data }: BenchmarkPageProps) {
  const [scenario, setScenario] = useState(data.selectedScenario);

  return (
    <div className="page-grid">
      <SectionCard
        title="Scenario Selection"
        subtitle="Aggregate anonymized benchmark results for the selected collateral and settlement scenario."
      >
        <div className="selector-row">
          <label htmlFor="scenario-select">Collateral / Settlement Scenario</label>
          <select
            id="scenario-select"
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
          >
            {data.scenarioOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="selector-caption">Viewing: {scenario}</span>
        </div>
      </SectionCard>

      <SectionCard title="Primary Metrics">
        <div className="metric-list">
          {data.primaryMetrics.map((metric) => (
            <MetricRow key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Secondary Metrics">
        <div className="metric-list">
          {data.secondaryMetrics.map((metric) => (
            <MetricRow key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Alerts">
        <div className="tag-list">
          {data.alerts.map((alert) => (
            <span key={alert} className="tag tag--alert">
              {alert}
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
