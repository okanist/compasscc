import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorContribute } from "../hooks";

export function AuditorContributeView() {
  const result = useAuditorContribute();

  return (
    <ViewState result={result} title="Contribution Policy Audit">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Contribution Policy And Enforcement">
            <RoleMetricGrid metrics={data.policy} />
          </SectionCard>
          <RoleListSection title="Retention Controls And Accepted Classes" items={data.controls} />
          <SectionCard title="Auditor Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
