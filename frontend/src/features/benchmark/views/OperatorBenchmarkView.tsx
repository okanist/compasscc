import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useOperatorBenchmark } from "../hooks";

export function OperatorBenchmarkView() {
  const result = useOperatorBenchmark();

  return (
    <ViewState result={result} title="Operator Benchmark Control">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Scenario-wide Metrics And Cohort Depth">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Benchmark Construction Quality" items={data.construction} />
          <SectionCard title="Operator Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
