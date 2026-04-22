import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorOverview } from "../hooks";

export function AuditorOverviewView() {
  const result = useAuditorOverview();

  return (
    <ViewState result={result} title="Auditor Overview">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Audit Readiness Summary" subtitle="Reliability, coverage, retention, and trail status for the current benchmark release.">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Release Scope" items={data.releaseScope} />
          <SectionCard title="Auditor Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
