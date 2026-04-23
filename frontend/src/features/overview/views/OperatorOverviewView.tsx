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
          <SectionCard title="Pending Submission Review" subtitle="Review contribution packages before they enter benchmark processing.">
            {data.pendingSubmissions.length ? (
              <div className="operator-review-list">
                {data.pendingSubmissions.map((submission) => (
                  <article key={submission.id} className="operator-review-row">
                    <div className="operator-review-row__main">
                      <span className="eyebrow">{submission.institution}</span>
                      <strong>{submission.submission_type}</strong>
                      <p>
                        Policy: {submission.policy_status} | Attestation: {submission.attestation_status} | Confidence: {submission.confidence_tier}
                      </p>
                    </div>
                    <div className="operator-review-row__actions">
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "approved")}>
                        Approve
                      </button>
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "needs_attestation")}>
                        Needs Attestation
                      </button>
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "rejected")}>
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="role-state-panel">No pending validations remain.</div>
            )}
            {result.reviewMessage ? (
              <div className={result.reviewStatus === "error" ? "role-state-panel role-state-panel--error" : "role-state-panel"}>
                {result.reviewMessage}
              </div>
            ) : null}
          </SectionCard>
          <SectionCard title="Operator Next Actions">
            <RoleActionGrid actions={data.actions} />
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
