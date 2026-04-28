import { SectionCard } from "../../../components/SectionCard";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import type { NavKey } from "../../../data/types";
import { useOperatorInstitutionReview } from "../hooks";

export function OperatorInstitutionReviewView({ onNavigate }: { onNavigate: (key: NavKey) => void }) {
  const result = useOperatorInstitutionReview();

  return (
    <ViewState result={result} title="Institution Output Review">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Institution Output Review Mode" subtitle="Operator view for selected institution output, eligibility, confidence, and handoff readiness.">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <SectionCard title="Output Summary">
            <div className="role-state-panel">
              {data.summary}
              {data.context?.privacySummary ? ` ${data.context.privacySummary}` : ""}
            </div>
          </SectionCard>
          <RoleListSection title="Handoff Readiness" items={data.handoff} />
          <SectionCard title="Operator Actions">
            <div className="operator-control-row">
              <button type="button" className="record-button" onClick={() => onNavigate("processing")}>
                Back to Processing
              </button>
              <button type="button" className="record-button" onClick={() => onNavigate("benchmark")}>
                Back to Benchmark Operations
              </button>
              <button type="button" className="record-button" onClick={() => onNavigate("campaign")}>
                Review Submission Queue
              </button>
            </div>
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
