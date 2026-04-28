import { useEffect, useRef, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useOperatorContribute } from "../hooks";

export function OperatorContributeView() {
  const result = useOperatorContribute();
  const pendingRef = useRef<HTMLDivElement>(null);
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);

  useEffect(() => {
    const handleReview = () => pendingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const handleApproveRelease = () => {
      if (result.data?.context.approveReleaseEnabled) {
        setReleaseConfirmOpen(true);
      }
    };

    window.addEventListener("compass:operator-contribution-review", handleReview);
    window.addEventListener("compass:operator-contribution-approve-release", handleApproveRelease);
    return () => {
      window.removeEventListener("compass:operator-contribution-review", handleReview);
      window.removeEventListener("compass:operator-contribution-approve-release", handleApproveRelease);
    };
  }, [result.data?.context.approveReleaseEnabled]);

  return (
    <ViewState result={result} title="Operator Contribution Workspace">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Campaign Configuration And Validation State">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Contribution Quality Distribution" items={data.qualityDistribution} />
          <RoleListSection title="Exceptions Queue" items={data.exceptions} />
          <SectionCard title="Pending Submission Review" subtitle="Review submitted contribution packages before benchmark processing.">
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
                      <p>Review state: {submission.review_status.replace("_", " ")}</p>
                    </div>
                    <div className="operator-review-row__actions">
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "approved")} disabled={result.actionStatus === "submitting"}>
                        Approve
                      </button>
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "needs_attestation")} disabled={result.actionStatus === "submitting"}>
                        Needs Attestation
                      </button>
                      <button type="button" className="record-button" onClick={() => void result.reviewSubmission(submission.id, "rejected")} disabled={result.actionStatus === "submitting"}>
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="role-state-panel">No pending submission reviews remain.</div>
            )}
          </SectionCard>
          <SectionCard title="Operator Actions">
            <div className="operator-next-action-panel">
              <div>
                <span className="eyebrow">Trigger Benchmark Run</span>
                <strong>{data.context.triggerEnabled ? "Ready" : "Blocked"}</strong>
                <p>{data.context.triggerMessage}</p>
              </div>
              <button
                type="button"
                className="record-button"
                onClick={() => void result.triggerProcessing()}
                disabled={!data.context.triggerEnabled || result.actionStatus === "submitting"}
              >
                {result.actionStatus === "submitting" ? "Working..." : "Trigger Benchmark Run"}
              </button>
            </div>
            <div className="operator-next-action-panel">
              <div>
                <span className="eyebrow">Benchmark Release Approval</span>
                <strong>{data.context.approveReleaseEnabled ? "Ready" : "Not Ready"}</strong>
                <p>{data.context.approveReleaseMessage}</p>
              </div>
              <button
                type="button"
                className="record-button"
                onClick={() => setReleaseConfirmOpen(true)}
                disabled={!data.context.approveReleaseEnabled || result.actionStatus === "submitting"}
              >
                Approve Release
              </button>
            </div>
            {result.actionMessage ? (
              <div className={result.actionStatus === "error" ? "role-state-panel role-state-panel--error" : "role-state-panel"}>
                {result.actionMessage}
              </div>
            ) : null}
          </SectionCard>
          {releaseConfirmOpen ? (
            <div className="modal-backdrop" role="presentation">
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="operator-release-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Approve Release</span>
                  <h3 id="operator-release-title">Approve Benchmark Release</h3>
                  <p>Approve benchmark release once processing is complete and release checks are ready.</p>
                </div>
                <div className="confirmation-summary">
                  <div>
                    <span>Campaign</span>
                    <strong>Campaign {data.context.campaignId}</strong>
                  </div>
                  <div>
                    <span>Run</span>
                    <strong>Run {data.context.latestRunId}</strong>
                  </div>
                  <div>
                    <span>Processing State</span>
                    <strong>{data.context.processingHealth.replace(/_/g, " ")}</strong>
                  </div>
                  <div>
                    <span>Release Readiness</span>
                    <strong>{data.context.releaseReadiness.replace(/_/g, " ")}</strong>
                  </div>
                </div>
                <div className="confirmation-modal__actions">
                  <button type="button" className="secondary-button" onClick={() => setReleaseConfirmOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="record-button"
                    onClick={() => {
                      setReleaseConfirmOpen(false);
                      void result.approveRelease();
                    }}
                    disabled={result.actionStatus === "submitting"}
                  >
                    Approve Release
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </ViewState>
  );
}
