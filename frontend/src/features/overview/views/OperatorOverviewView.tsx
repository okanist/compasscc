import { useEffect, useRef } from "react";
import { SectionCard } from "../../../components/SectionCard";
import { RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useOperatorOverview } from "../hooks";

export function OperatorOverviewView() {
  const result = useOperatorOverview();
  const pendingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTrigger = () => void result.triggerProcessing();
    const handleReview = () => pendingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.addEventListener("compass:operator-trigger-processing", handleTrigger);
    window.addEventListener("compass:operator-review-submissions", handleReview);
    return () => {
      window.removeEventListener("compass:operator-trigger-processing", handleTrigger);
      window.removeEventListener("compass:operator-review-submissions", handleReview);
    };
  }, [result]);

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
            <div ref={pendingRef} />
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
                      <p>
                        Review state: {submission.review_status.replace("_", " ")}
                        {submission.submitted_at ? ` | Submitted: ${new Date(submission.submitted_at).toLocaleString()}` : ""}
                      </p>
                    </div>
                    <div className="operator-review-row__actions">
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "approved")} disabled={result.reviewStatus === "submitting"}>
                        Approve
                      </button>
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "needs_attestation")} disabled={result.reviewStatus === "submitting"}>
                        Needs Attestation
                      </button>
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "rejected")} disabled={result.reviewStatus === "submitting"}>
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
            <div className="operator-next-action-panel">
              <div>
                <span className="eyebrow">Trigger Benchmark Run</span>
                <strong>{data.operatorContext?.triggerEnabled ? "Ready" : "Blocked"}</strong>
                <p>{data.operatorContext?.triggerMessage}</p>
              </div>
              <button
                type="button"
                className="record-button"
                onClick={() => void result.triggerProcessing()}
                disabled={!data.operatorContext?.triggerEnabled || result.actionStatus === "submitting"}
              >
                {result.actionStatus === "submitting" ? "Triggering..." : "Trigger Benchmark Run"}
              </button>
            </div>
            {result.actionMessage ? (
              <div className={result.actionStatus === "error" ? "role-state-panel role-state-panel--error" : "role-state-panel"}>
                {result.actionMessage}
              </div>
            ) : null}
          </SectionCard>
        </div>
      )}
    </ViewState>
  );
}
