import { InstitutionalNetworkAnimation } from "../../../components/InstitutionalNetworkAnimation";
import { ViewState } from "../../../components/primitives/ViewState";
import type { NavKey, OverviewData } from "../../../data/types";
import { useDeskOverview } from "../hooks";

interface DeskOverviewViewProps {
  data: OverviewData;
  onNavigate: (key: NavKey) => void;
}

export function DeskOverviewView({ data: initialData, onNavigate }: DeskOverviewViewProps) {
  const result = useDeskOverview(initialData);

  if (result.status !== "ready" || !result.data) {
    return <ViewState result={result} title="Institution Desk Overview">{() => null}</ViewState>;
  }

  const data = result.data;
  const kpiMap = new Map(data.kpis.map((kpi) => [kpi.label, kpi.value]));
  const kpiToneMap = new Map(data.kpis.map((kpi) => [kpi.label, kpi.tone ?? "neutral"]));
  const deskOverview = data.deskOverview;
  const benchmark = deskOverview?.benchmark;
  const networkIntelligence = deskOverview?.networkIntelligence;
  const metricValue = (label: string, fallback = "N/A") => kpiMap.get(label) ?? fallback;
  const primaryStats = [
    {
      label: "Benchmark Reliability",
      value: metricValue("Benchmark Reliability"),
      detail: "Trust-weighted cohort quality based on contribution depth and attestation coverage",
      emphasis: "primary" as const
    },
    {
      label: "Attested Coverage",
      value: metricValue("Attested Coverage"),
      detail: "Share of contributors with system-signed or externally attested inputs"
    },
    {
      label: "Cohort Depth",
      value: metricValue("Cohort Depth"),
      detail: "Active participants contributing to the current benchmark cycle"
    },
    {
      label: "Active Campaigns",
      value: metricValue("Active Campaigns"),
      detail: "Open contribution windows across current reporting scenarios"
    }
  ];
  const secondaryStatus = [
    { label: "Network Liquidity", value: metricValue("Network Liquidity"), tone: kpiToneMap.get("Network Liquidity") ?? "neutral" },
    { label: "Dispersion", value: metricValue("Dispersion"), tone: kpiToneMap.get("Dispersion") ?? "warning" },
    { label: "Confidential Boundary", value: metricValue("Confidential Boundary"), tone: kpiToneMap.get("Confidential Boundary") ?? "positive" },
    { label: "Last Refresh", value: metricValue("Last Refresh"), tone: kpiToneMap.get("Last Refresh") ?? "neutral" }
  ];
  const benchmarkStats = [
    { label: "Top Quartile", value: benchmark?.topQuartile ?? "N/A" },
    { label: "Median", value: benchmark?.median ?? "N/A" },
    { label: "Bottom Quartile", value: benchmark?.bottomQuartile ?? "N/A" }
  ];
  const contributionCards = deskOverview?.contributionCards?.length ? deskOverview.contributionCards : [
    { title: "Liquidity Contribution", status: metricValue("Own Contribution Status", "Not submitted"), action: "Submit Contribution", tone: "action" as const }
  ];
  const handleContributionAction = () => onNavigate("campaign");
  const routeFromRecentCategory = (category?: string): NavKey => {
    if (category === "institution_benchmark") {
      return "position";
    }

    if (category === "processing_reliability") {
      return "processing";
    }

    return "benchmark";
  };
  const networkRoute = networkIntelligence?.route ?? "benchmark";

  return (
    <div className="page-grid overview-page">
      <section className="overview-layer">
        <div className="overview-layer__header">
          <div>
            <span className="eyebrow">Network Intelligence Overview</span>
            <h3>Benchmark Trust Signals</h3>
          </div>
        </div>

        <div className="overview-stat-rail panel overview-stat-rail--trust">
          {primaryStats.map((kpi) => (
            <div
              key={kpi.label}
              className={kpi.emphasis === "primary" ? "rail-stat rail-stat--primary" : "rail-stat"}
            >
              <span className="eyebrow">{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <p>{kpi.detail}</p>
            </div>
          ))}
        </div>

        <div className="overview-status-strip">
          {secondaryStatus.map((item) => (
            <div
              key={item.label}
              className={`overview-status-chip overview-status-chip--${item.tone}`}
            >
              <span>{item.label}:</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="overview-layer">
        <div className="overview-layer__header">
          <div>
            <span className="eyebrow">Network And Institution Intelligence</span>
            <h3>Decision Support Workspace</h3>
          </div>
          <span className="overview-layer__caption">
            Translate benchmark context into institution-level action
          </span>
        </div>

        <div className="overview-dashboard-grid">
          <section className="panel insight-panel insight-panel--benchmark">
            <div className="insight-panel__header">
              <div>
                <h3>Liquidity Benchmark</h3>
                <p>Trust-weighted benchmark for the repo-with-treasury-collateral cohort</p>
              </div>
              <button type="button" className="text-link text-link--button" onClick={() => onNavigate("benchmark")}>
                View Details
              </button>
            </div>

            <div className="benchmark-callout">
              <div className="benchmark-callout__primary">
                <strong>{benchmark?.averageLiquidity ?? "N/A"}</strong>
                <span>Average Liquidity Score</span>
              </div>
              <div className="benchmark-callout__delta">
                <strong>{benchmark?.delta ?? metricValue("Own Benchmark Teaser")}</strong>
              </div>
            </div>

            <div className="curve-chart" aria-hidden="true">
              <svg viewBox="0 0 640 220" role="presentation">
                <defs>
                  <linearGradient id="curveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(212, 173, 112, 0.22)" />
                    <stop offset="45%" stopColor="rgba(117, 149, 205, 0.95)" />
                    <stop offset="100%" stopColor="rgba(82, 102, 147, 0.18)" />
                  </linearGradient>
                  <linearGradient id="curveFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(117, 149, 205, 0.24)" />
                    <stop offset="100%" stopColor="rgba(117, 149, 205, 0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M38 184 C120 184 160 170 220 140 C280 110 330 60 390 54 C460 48 508 96 560 138 C590 162 612 178 626 182"
                  fill="none"
                  stroke="url(#curveStroke)"
                  strokeWidth="3"
                />
                <path
                  d="M38 184 C120 184 160 170 220 140 C280 110 330 60 390 54 C460 48 508 96 560 138 C590 162 612 178 626 182 L626 196 L38 196 Z"
                  fill="url(#curveFill)"
                />
                <line
                  x1="390"
                  y1="54"
                  x2="390"
                  y2="196"
                  stroke="rgba(212, 173, 112, 0.55)"
                  strokeDasharray="4 6"
                />
                <circle cx="390" cy="54" r="8" fill="rgba(212, 173, 112, 0.95)" />
                <line x1="38" y1="196" x2="626" y2="196" stroke="rgba(134, 152, 183, 0.18)" />
              </svg>
            </div>

            <div className="benchmark-scale">
              {benchmarkStats.map((item) => (
                <div key={item.label} className="benchmark-scale__item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <p className="benchmark-interpretation">
              {benchmark?.interpretation ?? "Liquidity score reflects the active cohort benchmark."}
            </p>
          </section>

          <section className="panel insight-panel insight-panel--contribution">
            <div className="insight-panel__header">
              <div>
                <h3>Contribution Status</h3>
                <p>Q2 2026 contribution cycle</p>
              </div>
              <button type="button" className="text-link text-link--button" onClick={() => onNavigate("campaign")}>
                View All
              </button>
            </div>

            <div className="contribution-card-grid">
              {contributionCards.map((card) => (
                <article key={card.title} className="contribution-card">
                  <div className="contribution-card__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="presentation">
                      <path
                        d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-3 2-3-2-4 2V6a2 2 0 0 1 2-2Z"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <h4>{card.title}</h4>
                  <p>{card.status}</p>
                  <button type="button" className={`inline-action inline-action--${card.tone ?? "action"}`} onClick={handleContributionAction}>
                    {card.action}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel insight-panel insight-panel--network">
            <div className="insight-panel__header">
              <div>
                <h3>Institutional Network Intelligence</h3>
                <p>{networkIntelligence?.subtitle ?? data.informationBand.title}</p>
              </div>
              <button type="button" className="text-link text-link--button" onClick={() => onNavigate(networkRoute)}>
                Explore Network
              </button>
            </div>

            <div className="network-panel__body">
              <div className="network-mesh" aria-hidden="true">
                <InstitutionalNetworkAnimation />
              </div>

              <div className="network-copy">
                <span className="eyebrow">{networkIntelligence?.eyebrow ?? data.informationBand.title}</span>
                <h4>
                  {networkIntelligence?.headline ?? data.informationBand.body}
                </h4>
                <p>
                  {networkIntelligence?.body ?? data.processStrip.join(" / ")}
                </p>
                <button type="button" className="inline-action inline-action--action" onClick={() => onNavigate(networkRoute)}>
                  View Analysis
                </button>
              </div>
            </div>
          </section>

          <section className="panel insight-panel insight-panel--recent insight-panel--recent-light">
            <div className="insight-panel__header">
              <div>
                <h3>Recent Intelligence</h3>
                <p>Recent benchmark and explanation updates</p>
              </div>
              <button type="button" className="text-link text-link--button" onClick={() => onNavigate("benchmark")}>
                View All Updates
              </button>
            </div>

            <div className="recent-list">
              {(deskOverview?.recentIntelligence ?? []).map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className="recent-item recent-item--button"
                  onClick={() => onNavigate(item.route ?? routeFromRecentCategory(item.category))}
                >
                  <div className="recent-item__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="presentation">
                      <path
                        d="M7 4h7l5 5v11a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm7 1v4h4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    {item.meta ? <span>{item.meta}</span> : null}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
