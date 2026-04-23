import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorOutputAudit } from "../hooks";

export function AuditorOutputAuditView() {
  const result = useAuditorOutputAudit();

  return (
    <ViewState result={result} title="Institution Output Audit">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Institution-scoped Released Output">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Included And Excluded Scope" items={data.scope} />
          <SectionCard title="Audit Record Detail">
            <RoleMetricGrid metrics={data.recordMetrics} />
          </SectionCard>
          <RoleListSection title="Record Evidence References" items={data.evidenceRefs} />
          <RoleListSection title="Record Integrity Notes" items={data.integrityNotes} />
          <SectionCard title="Auditor Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
