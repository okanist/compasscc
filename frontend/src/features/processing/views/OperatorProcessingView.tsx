import { useEffect, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import type { NavKey } from "../../../data/types";
import { useOperatorProcessing } from "../hooks";

export function OperatorProcessingView({ onNavigate }: { onNavigate: (key: NavKey) => void }) {
  const result = useOperatorProcessing();
  const [triggerConfirmOpen, setTriggerConfirmOpen] = useState(false);
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      if (result.data?.context.triggerEnabled) {
        setTriggerConfirmOpen(true);
        return;
      }
      void result.trigger();
    };
    const handleApprove = () => {
      if (result.data?.context.approveReleaseEnabled) {
        setReleaseConfirmOpen(true);
        return;
      }
      void result.approveRelease();
    };

    window.addEventListener("compass:operator-processing-trigger", handleTrigger);
    window.addEventListener("compass:operator-processing-approve-release", handleApprove);
    return () => {
      window.removeEventListener("compass:operator-processing-trigger", handleTrigger);
      window.removeEventListener("compass:operator-processing-approve-release", handleApprove);
    };
  }, [result]);

  return (
    <ViewState result={result} title="Operator Processing Control">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Processing Jobs And Execution State">
            <RoleMetricGrid metrics={data.jobs} />
          </SectionCard>
          <RoleListSection title="Benchmark Run Lifecycle" items={data.lifecycle} />
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
                onClick={() => setTriggerConfirmOpen(true)}
                disabled={!data.context.triggerEnabled || result.actionStatus === "submitting"}
              >
                Trigger Benchmark Run
              </button>
            </div>
            <div className="operator-next-action-panel">
              <div>
                <span className="eyebrow">Approve Benchmark Release</span>
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
            {data.context.outputAvailable ? (
              <div className="operator-next-action-panel">
                <div>
                  <span className="eyebrow">Institution Output</span>
                  <strong>Available</strong>
                  <p>Derived institution outputs are available for operator review.</p>
                </div>
                <button type="button" className="record-button" onClick={() => onNavigate("position")}>
                  View Institution Output
                </button>
              </div>
            ) : null}
            {result.actionMessage ? (
              <div className={result.actionStatus === "error" ? "role-state-panel role-state-panel--error" : "role-state-panel"}>
                {result.actionMessage}
              </div>
            ) : null}
          </SectionCard>
          {triggerConfirmOpen ? (
            <div className="modal-backdrop" role="presentation">
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="operator-trigger-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Trigger Benchmark Run</span>
                  <h3 id="operator-trigger-title">Start Simulated TEE Processing</h3>
                  <p>Trigger benchmark processing after submitted packages have been reviewed.</p>
                </div>
                <div className="confirmation-summary">
                  <div><span>Campaign</span><strong>{data.context.campaignTitle ?? `Campaign ${data.campaignId}`}</strong></div>
                  <div><span>Scenario</span><strong>{data.context.scenario ?? "Active scenario"}</strong></div>
                  <div><span>Approved Submissions</span><strong>{data.context.approvedSubmissions}</strong></div>
                  <div><span>Pending Reviews</span><strong>{data.context.pendingReviews}</strong></div>
                  <div><span>Raw Data Exposure</span><strong>None</strong></div>
                </div>
                <div className="confirmation-modal__actions">
                  <button type="button" className="secondary-button" onClick={() => setTriggerConfirmOpen(false)}>Cancel</button>
                  <button
                    type="button"
                    className="record-button"
                    onClick={() => {
                      setTriggerConfirmOpen(false);
                      void result.trigger();
                    }}
                  >
                    Trigger Benchmark Run
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {releaseConfirmOpen ? (
            <div className="modal-backdrop" role="presentation">
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="operator-release-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Approve Release</span>
                  <h3 id="operator-release-title">Approve Derived Benchmark Outputs</h3>
                  <p>Approve the derived benchmark release after simulated confidential processing has completed.</p>
                </div>
                <div className="confirmation-summary">
                  <div><span>Processing Run</span><strong>Run {data.runId}</strong></div>
                  <div><span>Campaign / Scenario</span><strong>{data.context.scenario ?? data.context.campaignTitle ?? "Active campaign"}</strong></div>
                  <div><span>Release Readiness</span><strong>{data.context.releaseReadiness.replace(/_/g, " ")}</strong></div>
                  <div><span>Valid Inputs</span><strong>{data.jobs.find((metric) => metric.label === "Valid Inputs")?.value ?? "0"}</strong></div>
                  <div><span>Raw Data Exposure</span><strong>{data.context.rawDataExposure}</strong></div>
                  <div><span>Simulated TEE Status</span><strong>{data.context.simulatedTeeStatus}</strong></div>
                </div>
                <div className="confirmation-modal__actions">
                  <button type="button" className="secondary-button" onClick={() => setReleaseConfirmOpen(false)}>Cancel</button>
                  <button
                    type="button"
                    className="record-button"
                    onClick={() => {
                      setReleaseConfirmOpen(false);
                      void result.approveRelease();
                    }}
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
