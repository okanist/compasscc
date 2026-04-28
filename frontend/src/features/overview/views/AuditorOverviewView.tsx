import { SectionCard } from "../../../components/SectionCard";
import type { NavKey } from "../../../data/types";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorOverview } from "../hooks";

interface AuditorOverviewViewProps {
  onNavigate: (key: NavKey) => void;
}

export function AuditorOverviewView({ onNavigate }: AuditorOverviewViewProps) {
  const result = useAuditorOverview();

  const handleAction = (title: string) => {
    if (title === "View Audit Trail") {
      onNavigate("position");
      return;
    }

    onNavigate("processing");
  };

  return (
    <ViewState result={result} title="Auditor Overview">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Audit Readiness Summary" subtitle="Reliability, coverage, retention, and trail status for the current benchmark release.">
            <div className={data.context.releaseReady ? "contribution-status-panel" : "contribution-status-panel contribution-status-panel--error"}>
              <strong>{data.context.releaseReady ? "Released benchmark evidence available" : "Audit package awaiting release"}</strong>
              <p>{data.context.message}</p>
            </div>
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection
            title="Release Scope"
            subtitle="Auditor-safe scope includes derived outputs and references only. Raw institution and peer contribution payloads remain excluded."
            items={data.releaseScope}
          />
          <SectionCard title="Auditor Actions">
            <div className="position-action-grid">
              {data.actions.map((action) => {
                const packageActionUnavailable = action.title === "View Audit Package" && !data.context.packageAvailable;
                return (
                  <button
                    key={action.title}
                    type="button"
                    className="position-action-card auditor-action-button"
                    onClick={() => handleAction(action.title)}
                    disabled={packageActionUnavailable}
                    title={packageActionUnavailable ? "Audit package becomes available after benchmark release." : action.title}
                  >
                    <span className="eyebrow">{action.title}</span>
                    <p>{packageActionUnavailable ? "Audit package becomes available after benchmark release." : action.body}</p>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
