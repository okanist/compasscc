import { useMemo, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import { ViewState } from "../../../components/primitives/ViewState";
import type { BenchmarkData, NavKey } from "../../../data/types";
import { useDeskBenchmark } from "../hooks";

interface DeskBenchmarkViewProps {
  data: BenchmarkData;
  onNavigate: (key: NavKey) => void;
}

const benchmarkHighlights = [
  {
    label: "Trust-Weighted Benchmark Score",
    context: "Strong benchmark construction quality",
    emphasis: "primary"
  },
  {
    label: "Benchmark Reliability",
    context: "High confidence across attested cohort inputs",
    emphasis: "primary"
  },
  {
    label: "Average Liquidity",
    context: "Above median benchmark conditions"
  },
  {
    label: "Liquidity Dispersion",
    context: "Elevated variation across contributors"
  }
];

const alertTone: Record<string, string> = {
  LIQUIDITY_OK: "positive",
  ELEVATED_DISPERSION: "amber",
  HAIRCUT_STRESS_SIGNAL: "stress"
};

export function DeskBenchmarkView({ data: initialData, onNavigate }: DeskBenchmarkViewProps) {
  const [scenario, setScenario] = useState(initialData.selectedScenario);
  const result = useDeskBenchmark(initialData, scenario);
  const data = result.data ?? initialData;
  const benchmarkReady = Boolean(data.context?.benchmarkReady);

  const metricMap = useMemo(
    () => new Map(data.primaryMetrics.map((metric) => [metric.label, metric.value])),
    [data.primaryMetrics]
  );
  const contextStrip = [
    { label: "Active Cohort", value: data.context?.activeCohort ?? `${metricMap.get("Contributor Count") ?? "N/A"} contributors` },
    { label: "Attested Coverage", value: data.context?.attestedCoverage ?? "N/A" },
    { label: "Last Refresh", value: data.context?.lastRefresh ?? "Pending" }
  ];
  const confidenceNotes = data.context?.confidenceNotes?.length
    ? data.context.confidenceNotes
    : [
        "Signals reflect cohort-level benchmark behavior, not institution-specific raw contribution values.",
        "Benchmark reliability depends on contribution depth, attested coverage, and confidence tier.",
        "All outputs shown here are derived from anonymized benchmark computation."
      ];

  if (result.status !== "ready" || !result.data) {
    return <ViewState result={result} title="Institution Desk Benchmark">{() => null}</ViewState>;
  }

  if (!benchmarkReady) {
    return (
      <div className="page-grid benchmark-page">
        <SectionCard
          title="Benchmark Intelligence Is Not Ready Yet"
          subtitle="Cohort-level benchmark intelligence becomes available after Alpha Bank submits its prepared contribution package and simulated confidential processing completes."
        >
          <div className="role-state-panel">
            {data.context?.notReadyMessage ??
              "Benchmark intelligence becomes available after the contribution package is submitted and processed."}
          </div>
          <div className="processing-action-row">
            <button type="button" className="record-button" onClick={() => onNavigate("campaign")}>
              View Contribution Package
            </button>
            <button type="button" className="record-button" onClick={() => onNavigate("processing")}>
              View Processing Status
            </button>
            <button type="button" className="record-button" onClick={() => void result.refresh()}>
              Refresh Status
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="page-grid benchmark-page">
      <SectionCard
        title="Scenario Selection"
        subtitle="Aggregate anonymized benchmark results for the selected collateral and settlement scenario."
      >
        <div className="benchmark-scenario-panel">
          <div className="selector-row benchmark-selector-row">
            <label htmlFor="scenario-select">Collateral / Settlement Scenario</label>
            {data.scenarioOptions.length > 1 ? (
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
            ) : (
              <div className="scenario-static-value" id="scenario-select">{data.selectedScenario}</div>
            )}
          </div>

          <div className="benchmark-context-strip" aria-label="Selected scenario context">
            {contextStrip.map((item) => (
              <div key={item.label} className="benchmark-context-item">
                <span className="eyebrow">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Network Signal Summary">
        <div className="network-signal-card">
          <p className="network-signal-card__lead">
            {data.context?.networkSignalSummary ??
              "Derived cohort intelligence is available for the selected scenario without exposing raw institution or peer positions."}
          </p>
          <div className="network-signal-lines">
            <span>Liquidity signal: {metricMap.get("Average Liquidity") ?? "N/A"}</span>
            <span>Reliability: {metricMap.get("Benchmark Reliability") ?? "N/A"}</span>
            <span>Dispersion: {metricMap.get("Liquidity Dispersion") ?? "N/A"}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Benchmark Highlights">
        <div className="benchmark-highlight-grid">
          {benchmarkHighlights.map((item) => (
            <article
              key={item.label}
              className={
                item.emphasis === "primary"
                  ? "benchmark-highlight-card benchmark-highlight-card--primary"
                  : "benchmark-highlight-card"
              }
            >
              <span className="eyebrow">{item.label}</span>
              <strong>{metricMap.get(item.label) ?? "N/A"}</strong>
              <p>{item.context}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Benchmark Distribution"
        subtitle="Cohort-level position of the active benchmark under the selected scenario."
      >
        <div className="benchmark-distribution-panel">
          <div className="benchmark-distribution-copy">
            <span className="eyebrow">Current Cohort Benchmark Signal</span>
            <strong>{metricMap.get("Trust-Weighted Benchmark Score") ?? "88.6"}</strong>
            <p>
              Current signal is derived from anonymized cohort computation. Quartiles describe the benchmark
              distribution and do not reveal raw peer positions.
            </p>
            <div className="benchmark-context-strip" aria-label="Benchmark quartiles">
              <div className="benchmark-context-item">
                <span className="eyebrow">Bottom Quartile</span>
                <strong>{data.distribution?.bottomQuartile ?? "N/A"}</strong>
              </div>
              <div className="benchmark-context-item">
                <span className="eyebrow">Median</span>
                <strong>{data.distribution?.median ?? "N/A"}</strong>
              </div>
              <div className="benchmark-context-item">
                <span className="eyebrow">Top Quartile</span>
                <strong>{data.distribution?.topQuartile ?? "N/A"}</strong>
              </div>
            </div>
          </div>
          <div className="benchmark-distribution-visual" aria-label="Benchmark distribution with lower quartile, median, current benchmark, and upper quartile">
            <svg viewBox="0 0 640 190" role="img">
              <path
                d="M48 140 C130 132 154 92 226 92 C298 92 314 130 380 126 C472 120 486 58 592 52"
                fill="none"
                stroke="rgba(149, 160, 178, 0.24)"
                strokeWidth="2"
              />
              <path
                d="M48 140 C130 132 154 92 226 92 C298 92 314 130 380 126 C472 120 486 58 592 52 L592 160 L48 160 Z"
                fill="rgba(223, 187, 131, 0.06)"
              />
              <line x1="116" y1="44" x2="116" y2="160" stroke="rgba(149, 160, 178, 0.18)" />
              <line x1="296" y1="44" x2="296" y2="160" stroke="rgba(149, 160, 178, 0.18)" />
              <line x1="456" y1="44" x2="456" y2="160" stroke="rgba(149, 160, 178, 0.18)" />
              <line x1="520" y1="34" x2="520" y2="160" stroke="var(--accent-text)" strokeWidth="1.5" />
              <circle cx="520" cy="68" r="5" fill="var(--accent-text)" />
              <g className="benchmark-distribution-labels">
                <text x="116" y="178" textAnchor="middle">Lower quartile</text>
                <text x="296" y="178" textAnchor="middle">Median</text>
                <text x="456" y="178" textAnchor="middle">Upper quartile</text>
                <text x="520" y="26" textAnchor="middle">Current</text>
              </g>
            </svg>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Primary Metrics">
        <div className="benchmark-reference-grid benchmark-reference-grid--primary">
          {data.primaryMetrics.map((metric) => (
            <div key={metric.label} className="benchmark-reference-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Secondary Metrics">
        <div className="benchmark-reference-grid benchmark-reference-grid--secondary">
          {data.secondaryMetrics.map((metric) => (
            <div key={metric.label} className="benchmark-reference-card benchmark-reference-card--secondary">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Benchmark Alerts"
        subtitle="Alerts reflect cohort-level benchmark conditions derived from anonymized contribution and attested coverage."
      >
        <div className="benchmark-alert-list">
          {data.alerts.map((alert) => (
            <span
              key={alert}
              className={`benchmark-alert-chip benchmark-alert-chip--${alertTone[alert] ?? "neutral"}`}
            >
              {alert}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Benchmark Confidence Notes">
        <div className="benchmark-confidence-notes">
          {confidenceNotes.map((note, index) => (
            <p key={note}>
              <span>0{index + 1}</span>
              {note}
            </p>
          ))}
        </div>
        <div className="processing-action-row">
          <button type="button" className="record-button" onClick={() => onNavigate("position")}>
            Compare to My Position
          </button>
          <button type="button" className="record-button" onClick={() => void result.refresh()}>
            Refresh Benchmark
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
