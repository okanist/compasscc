interface KpiCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "warning";
}

export function KpiCard({ label, value, tone = "neutral" }: KpiCardProps) {
  return (
    <div className={`panel kpi-card kpi-card--${tone}`}>
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

