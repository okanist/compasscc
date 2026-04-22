import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useOperatorContribute } from "../hooks";

export function OperatorContributeView() {
  const result = useOperatorContribute();

  return (
    <ViewState result={result} title="Operator Contribution Workspace">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Campaign Configuration And Validation State">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Contribution Quality Distribution" items={data.qualityDistribution} />
          <RoleListSection title="Exceptions Queue" items={data.exceptions} />
          <SectionCard title="Operator Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
