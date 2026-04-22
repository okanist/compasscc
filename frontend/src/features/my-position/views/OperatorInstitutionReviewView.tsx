import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useOperatorInstitutionReview } from "../hooks";

export function OperatorInstitutionReviewView() {
  const result = useOperatorInstitutionReview();

  return (
    <ViewState result={result} title="Institution Output Review">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Institution Output Review Mode" subtitle="Operator view for selected institution output, eligibility, confidence, and handoff readiness.">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Handoff Readiness" items={data.handoff} />
          <SectionCard title="Operator Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
