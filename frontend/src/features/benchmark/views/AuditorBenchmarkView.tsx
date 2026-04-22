import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorBenchmark } from "../hooks";

export function AuditorBenchmarkView() {
  const result = useAuditorBenchmark();

  return (
    <ViewState result={result} title="Benchmark Audit Review">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Methodology, Reliability, And Released Scope">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Benchmark Audit Notes" items={data.notes} />
          <SectionCard title="Auditor Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
