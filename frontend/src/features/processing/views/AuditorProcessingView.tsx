import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorProcessing } from "../hooks";

export function AuditorProcessingView() {
  const result = useAuditorProcessing();

  return (
    <ViewState result={result} title="Processing Evidence Review">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Runtime Guarantees And Disclosure Boundary">
            <RoleMetricGrid metrics={data.guarantees} />
          </SectionCard>
          <RoleListSection title="Evidence References" items={data.evidence} />
          <RoleListSection title="Step And Evidence Summary" items={data.stepSummary} />
          <SectionCard title="Auditor Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
