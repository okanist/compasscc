import { SectionCard } from "../SectionCard";

export interface RoleMetric {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "positive" | "warning";
}

export interface RoleAction {
  title: string;
  body: string;
}

export function RoleMetricGrid({ metrics }: { metrics: RoleMetric[] }) {
  return (
    <div className="details-grid">
      {metrics.map((metric) => (
        <div key={metric.label} className="metric-block">
          <span className="eyebrow">{metric.label}</span>
          <strong>{metric.value}</strong>
          {metric.detail ? <p>{metric.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function RoleActionGrid({ actions }: { actions: RoleAction[] }) {
  return (
    <div className="position-action-grid">
      {actions.map((action) => (
        <article key={action.title} className="position-action-card">
          <span className="eyebrow">{action.title}</span>
          <p>{action.body}</p>
        </article>
      ))}
    </div>
  );
}

export function RoleListSection({
  title,
  subtitle,
  items
}: {
  title: string;
  subtitle?: string;
  items: string[];
}) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="tag-list">
        {items.map((item) => (
          <span key={item} className="tag">
            {item}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
