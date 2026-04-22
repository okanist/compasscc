import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useOperatorOverview } from "../hooks";

export function OperatorOverviewView() {
  const result = useOperatorOverview();

  return (
    <ViewState result={result} title="Operator Overview">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Campaign Operations Summary" subtitle="Operational state for active contribution and benchmark cycles.">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <SectionCard title="Validation And Processing Health">
            <RoleMetricGrid metrics={data.health} />
          </SectionCard>
          <SectionCard title="Operator Next Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
