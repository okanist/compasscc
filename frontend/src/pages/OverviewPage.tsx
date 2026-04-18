import { InstitutionalNetworkAnimation } from "../components/InstitutionalNetworkAnimation";
import type { OverviewData } from "../data/types";

interface OverviewPageProps {
  data: OverviewData;
}

export function OverviewPage({ data }: OverviewPageProps) {
  const kpiMap = new Map(data.kpis.map((kpi) => [kpi.label, kpi.value]));
  const primaryStats = [
    {
      label: "Benchmark Reliability",
      value: kpiMap.get("Benchmark Reliability") ?? "91.4%",
      detail: "Trust-weighted cohort quality based on contribution depth and attestation coverage",
      emphasis: "primary" as const
    },
    {
      label: "Attested Coverage",
      value: "68%",
      detail: "Share of contributors with system-signed or externally attested inputs"
    },
    {
      label: "Cohort Depth",
      value: kpiMap.get("Total Contributors") ?? "28",
      detail: "Active participants contributing to the current benchmark cycle"
    },
    {
      label: "Active Campaigns",
      value: kpiMap.get("Active Intelligence Campaigns") ?? "3",
      detail: "Open contribution windows across current reporting scenarios"
    }
  ];
  const secondaryStatus = [
    { label: "Network Liquidity", value: "Stable", tone: "neutral" },
    { label: "Dispersion", value: "Elevated", tone: "warning" },
    { label: "Confidential Boundary", value: "Active", tone: "positive" },
    { label: "Last Refresh", value: "4 min ago", tone: "neutral" }
  ];
  const benchmarkStats = [
    { label: "Top Quartile", value: "81.2" },
    { label: "Median", value: "73.8" },
    { label: "Bottom Quartile", value: "62.4" }
  ];
  const contributionCards = [
    { title: "Liquidity Contribution", status: "Submitted Apr 15", action: "Completed", tone: "success" },
    { title: "Collateral Profile", status: "Attestation window open", action: "Review & Attest", tone: "action" },
    { title: "Treasury Duration", status: "Next contribution cycle in 4 days", action: "Prepare Draft", tone: "ghost" }
  ];
  const intelligenceItems = [
    "Repo liquidity remains resilient despite higher tenor dispersion across attested contributors.",
    "Treasury-heavy desks are widening haircut assumptions in mixed collateral scenarios.",
    "Confidential processing reliability remains above target for the active campaign cohort."
  ];

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
              <a href="#benchmark" className="text-link">
                View Details
              </a>
            </div>

            <div className="benchmark-callout">
              <div className="benchmark-callout__primary">
                <strong>73.8</strong>
                <span>Average Liquidity Score</span>
              </div>
              <div className="benchmark-callout__delta">
                <strong>+4.7 pts vs. peer median</strong>
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
              Liquidity score sits in the upper half of the active cohort
            </p>
          </section>

          <section className="panel insight-panel insight-panel--contribution">
            <div className="insight-panel__header">
              <div>
                <h3>Contribution Status</h3>
                <p>Q2 2026 contribution cycle</p>
              </div>
              <a href="#campaign" className="text-link">
                View All
              </a>
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
                  <button type="button" className={`inline-action inline-action--${card.tone}`}>
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
                <p>
                  Strategic interpretation of anonymized contribution across the active benchmark cohort
                </p>
              </div>
              <a href="#position" className="text-link">
                Explore Network
              </a>
            </div>

            <div className="network-panel__body">
              <div className="network-mesh" aria-hidden="true">
                <InstitutionalNetworkAnimation />
              </div>

              <div className="network-copy">
                <span className="eyebrow">Strategic Network Signal</span>
                <h4>
                  The desk remains within acceptable network liquidity bounds, but funding efficiency
                  trails peers under mixed repo and treasury collateral conditions.
                </h4>
                <p>
                  Anonymized contribution continues to produce benchmark-level intelligence without
                  exposing institution-level positions.
                </p>
                <button type="button" className="inline-action inline-action--action">
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
              <a href="#overview" className="text-link">
                View All Updates
              </a>
            </div>

            <div className="recent-list">
              {intelligenceItems.map((item, index) => (
                <article key={item} className="recent-item">
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
                    <strong>{item}</strong>
                    <span>
                      {index === 0
                        ? "Updated 12 minutes ago"
                        : index === 1
                          ? "Campaign note from operator"
                          : "Reliability checkpoint passed"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
