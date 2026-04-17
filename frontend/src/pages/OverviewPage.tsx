import type { OverviewData } from "../data/types";

interface OverviewPageProps {
  data: OverviewData;
}

export function OverviewPage({ data }: OverviewPageProps) {
  const primaryStats = data.kpis.slice(0, 4);
  const benchmarkStats = [
    { label: "Top Quartile", value: "81.2" },
    { label: "Median", value: "73.8" },
    { label: "Bottom Quartile", value: "62.4" }
  ];

  const contributionCards = [
    { title: "Liquidity Contribution", status: "Submitted Apr 15", action: "Completed", tone: "success" },
    { title: "Collateral Profile", status: "Attestation window open", action: "Review & Attest", tone: "action" },
    { title: "Treasury Duration", status: "Next cycle in 4 days", action: "Prepare Draft", tone: "ghost" }
  ];

  const intelligenceItems = [
    "Repo liquidity remains resilient despite higher tenor dispersion across attested contributors.",
    "Treasury-heavy desks are widening haircut assumptions in mixed collateral scenarios.",
    "Confidential processing reliability remains above target for the active campaign cohort."
  ];

  return (
    <div className="page-grid">
      <section className="overview-hero">
        <div>
          <span className="eyebrow">Network Intelligence Overview</span>
          <h2>Good evening, Alpha Bank.</h2>
          <p>
            Compass translates privacy-preserving contribution into institutional intelligence with
            confidential processing, deterministic analytics, and auditable outputs on Canton.
          </p>
        </div>
        <div className="overview-hero__actions">
          <div className="hero-status">
            <span className="hero-status__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path
                  d="M7 10V7a5 5 0 0 1 10 0v3m-9 0h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <div>
              <strong>Confidential Processing</strong>
              <span>Attested boundary active</span>
            </div>
          </div>
          <button type="button" className="executive-brief-button">
            Generate Executive Brief
          </button>
        </div>
      </section>

      <div className="overview-stat-rail panel">
        {primaryStats.map((kpi) => (
          <div key={kpi.label} className="rail-stat">
            <span className="eyebrow">{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <p>{kpi.label === "Benchmark Reliability" ? "Trust-weighted benchmark cohort stable" : "Updated within the current campaign cycle"}</p>
          </div>
        ))}
      </div>

      <div className="overview-feature-grid">
        <section className="panel insight-panel insight-panel--benchmark">
          <div className="insight-panel__header">
            <div>
              <h3>Benchmark Distribution</h3>
              <p>Repo with Treasury Collateral</p>
            </div>
            <a href="#benchmark" className="text-link">
              View Details
            </a>
          </div>

          <div className="benchmark-callout">
            <div>
              <strong>73.8</strong>
              <span>Average Liquidity</span>
            </div>
            <div className="benchmark-callout__delta">
              <strong>+4.7 pts</strong>
              <span>vs. institution median</span>
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
              <path d="M38 184 C120 184 160 170 220 140 C280 110 330 60 390 54 C460 48 508 96 560 138 C590 162 612 178 626 182" fill="none" stroke="url(#curveStroke)" strokeWidth="3" />
              <path d="M38 184 C120 184 160 170 220 140 C280 110 330 60 390 54 C460 48 508 96 560 138 C590 162 612 178 626 182 L626 196 L38 196 Z" fill="url(#curveFill)" />
              <line x1="390" y1="54" x2="390" y2="196" stroke="rgba(212, 173, 112, 0.55)" strokeDasharray="4 6" />
              <circle cx="390" cy="54" r="8" fill="rgba(212, 173, 112, 0.95)" />
              <line x1="38" y1="196" x2="626" y2="196" stroke="rgba(134, 152, 183, 0.18)" />
            </svg>
          </div>

          <div className="benchmark-scale">
            {benchmarkStats.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel insight-panel insight-panel--contribution">
          <div className="insight-panel__header">
            <div>
              <h3>Contribution Status</h3>
              <p>Q2 2026 reporting cycle</p>
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
      </div>

      <div className="overview-lower-grid">
        <section className="panel insight-panel insight-panel--network">
          <div className="insight-panel__header">
            <div>
              <h3>Institutional Network Intelligence</h3>
              <p>Anonymized signals from attested Canton contributors</p>
            </div>
            <a href="#position" className="text-link">
              Explore Network
            </a>
          </div>

          <div className="network-panel__body">
            <div className="network-mesh" aria-hidden="true">
              <svg viewBox="0 0 520 240" role="presentation">
                <g stroke="rgba(95, 118, 158, 0.28)" strokeWidth="1.1">
                  <line x1="48" y1="142" x2="102" y2="98" />
                  <line x1="102" y1="98" x2="168" y2="134" />
                  <line x1="168" y1="134" x2="224" y2="80" />
                  <line x1="224" y1="80" x2="286" y2="126" />
                  <line x1="286" y1="126" x2="334" y2="70" />
                  <line x1="334" y1="70" x2="392" y2="118" />
                  <line x1="392" y1="118" x2="456" y2="84" />
                  <line x1="80" y1="54" x2="102" y2="98" />
                  <line x1="140" y1="52" x2="168" y2="134" />
                  <line x1="192" y1="44" x2="224" y2="80" />
                  <line x1="248" y1="46" x2="224" y2="80" />
                  <line x1="300" y1="48" x2="334" y2="70" />
                  <line x1="360" y1="48" x2="392" y2="118" />
                  <line x1="112" y1="188" x2="168" y2="134" />
                  <line x1="196" y1="184" x2="224" y2="80" />
                  <line x1="262" y1="190" x2="286" y2="126" />
                  <line x1="334" y1="188" x2="286" y2="126" />
                  <line x1="410" y1="180" x2="392" y2="118" />
                  <line x1="48" y1="142" x2="112" y2="188" />
                  <line x1="112" y1="188" x2="196" y2="184" />
                  <line x1="196" y1="184" x2="262" y2="190" />
                  <line x1="262" y1="190" x2="334" y2="188" />
                  <line x1="334" y1="188" x2="410" y2="180" />
                  <line x1="168" y1="134" x2="262" y2="190" />
                  <line x1="224" y1="80" x2="334" y2="188" />
                </g>
                {[
                  [48, 142, "soft"],
                  [102, 98, "gold"],
                  [168, 134, "gold"],
                  [224, 80, "blue"],
                  [286, 126, "gold"],
                  [334, 70, "gold"],
                  [392, 118, "blue"],
                  [456, 84, "soft"],
                  [80, 54, "soft"],
                  [140, 52, "soft"],
                  [192, 44, "gold"],
                  [248, 46, "soft"],
                  [300, 48, "soft"],
                  [360, 48, "gold"],
                  [112, 188, "soft"],
                  [196, 184, "gold"],
                  [262, 190, "soft"],
                  [334, 188, "gold"],
                  [410, 180, "blue"]
                ].map(([cx, cy, tone], index) => (
                  <g key={`${cx}-${cy}-${index}`}>
                    <circle cx={Number(cx)} cy={Number(cy)} r="9" className={`network-node network-node--${tone}`} />
                    <circle cx={Number(cx)} cy={Number(cy)} r="4" className="network-node__core" />
                  </g>
                ))}
              </svg>
            </div>

            <div className="network-copy">
              <span className="eyebrow">Trending Insight</span>
              <h4>{data.informationBand.title}</h4>
              <p>{data.informationBand.body}</p>
              <div className="process-strip process-strip--compact">
                {data.processStrip.map((step) => (
                  <div key={step} className="process-step">
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel insight-panel insight-panel--recent">
          <div className="insight-panel__header">
            <div>
              <h3>Recent Intelligence</h3>
              <p>Local explanation and benchmark updates</p>
            </div>
            <a href="#overview" className="text-link">
              View Library
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
                  <span>{index === 0 ? "Updated 12 minutes ago" : index === 1 ? "Campaign note from operator" : "Reliability checkpoint passed"}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
