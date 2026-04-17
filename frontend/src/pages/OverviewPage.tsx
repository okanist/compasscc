import { KpiCard } from "../components/KpiCard";
import { SectionCard } from "../components/SectionCard";
import type { OverviewData } from "../data/types";

interface OverviewPageProps {
  data: OverviewData;
}

export function OverviewPage({ data }: OverviewPageProps) {
  return (
    <div className="page-grid">
      <section className="hero-panel panel">
        <div>
          <span className="eyebrow">Network Intelligence Overview</span>
          <h2>Private activity can still produce shared institutional intelligence.</h2>
          <p>
            Compass turns privacy-preserving contribution into benchmark-driven market visibility for Canton
            participants without exposing raw proprietary positions.
          </p>
        </div>
      </section>

      <div className="kpi-grid">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} tone={kpi.tone} />
        ))}
      </div>

      <section className="information-band panel">
        <span className="eyebrow">{data.informationBand.title}</span>
        <p>{data.informationBand.body}</p>
      </section>

      <SectionCard title="Process Strip" subtitle="Deterministic analytics and auditable workflow from contribution to output.">
        <div className="process-strip">
          {data.processStrip.map((step) => (
            <div key={step} className="process-step">
              <span>{step}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

