import { useEffect, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import type { NavKey } from "../../../data/types";
import { useOperatorBenchmark } from "../hooks";

export function OperatorBenchmarkView({ onNavigate }: { onNavigate: (key: NavKey) => void }) {
  const result = useOperatorBenchmark();
  const [triggerConfirmOpen, setTriggerConfirmOpen] = useState(false);
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      if (result.data?.context.triggerEnabled) {
        setTriggerConfirmOpen(true);
        return;
      }
      void result.triggerProcessing();
    };
    const handleApprove = () => {
      if (result.data?.context.approveReleaseEnabled) {
        setReleaseConfirmOpen(true);
        return;
      }
      void result.approveRelease();
    };

    window.addEventListener("compass:operator-benchmark-trigger", handleTrigger);
    window.addEventListener("compass:operator-benchmark-approve-release", handleApprove);
    return () => {
      window.removeEventListener("compass:operator-benchmark-trigger", handleTrigger);
      window.removeEventListener("compass:operator-benchmark-approve-release", handleApprove);
    };
  }, [result]);

  return (
    <ViewState result={result} title="Operator Benchmark Control">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Scenario-wide Metrics And Cohort Depth">
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Benchmark Construction Quality" items={data.construction} />
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
                <strong>{data.context.approveReleaseEnabled ? "Ready" : data.context.releaseReadiness === "approved" ? "Approved" : "Not Ready"}</strong>
                <p>{data.context.approveReleaseMessage}</p>
              </div>
              <button
                type="button"
                className="record-button"
                onClick={() => setReleaseConfirmOpen(true)}
                disabled={!data.context.approveReleaseEnabled || result.actionStatus === "submitting"}
              >
                {data.context.releaseReadiness === "approved" ? "Release Approved" : "Approve Release"}
              </button>
            </div>
            <div className="operator-control-row">
              <button type="button" className="record-button" onClick={() => onNavigate("processing")}>
                View Processing Run
              </button>
              {data.context.outputAvailable ? (
                <button type="button" className="record-button" onClick={() => onNavigate("position")}>
                  View Institution Output
                </button>
              ) : null}
              <button type="button" className="record-button" onClick={() => void result.refresh()}>
                Refresh
              </button>
            </div>
            {result.actionMessage ? (
              <div className={result.actionStatus === "error" ? "role-state-panel role-state-panel--error" : "role-state-panel"}>
                {result.actionMessage}
              </div>
            ) : null}
          </SectionCard>
          {triggerConfirmOpen ? (
            <div className="modal-backdrop" role="presentation">
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="benchmark-trigger-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Trigger Benchmark Run</span>
                  <h3 id="benchmark-trigger-title">Recompute Scenario-Wide Metrics</h3>
                  <p>Recompute scenario-wide metrics from the latest validated batch.</p>
                </div>
                <div className="confirmation-summary">
                  <div><span>Scenario</span><strong>{data.context.scenario ?? "Active scenario"}</strong></div>
                  <div><span>Cohort Depth</span><strong>{data.context.cohortDepth}</strong></div>
                  <div><span>Contribution Mix</span><strong>{data.context.contributionMix}</strong></div>
                  <div><span>Raw Data Exposure</span><strong>None</strong></div>
                </div>
                <div className="confirmation-modal__actions">
                  <button type="button" className="secondary-button" onClick={() => setTriggerConfirmOpen(false)}>Cancel</button>
                  <button
                    type="button"
                    className="record-button"
                    onClick={() => {
                      setTriggerConfirmOpen(false);
                      void result.triggerProcessing();
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
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="benchmark-release-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Approve Release</span>
                  <h3 id="benchmark-release-title">Approve Benchmark Release</h3>
                  <p>Approve benchmark release once processing is complete and release checks are ready.</p>
                </div>
                <div className="confirmation-summary">
                  <div><span>Run ID</span><strong>Run {data.context.runId}</strong></div>
                  <div><span>Scenario</span><strong>{data.context.scenario ?? "Active scenario"}</strong></div>
                  <div><span>Cohort Depth</span><strong>{data.context.cohortDepth}</strong></div>
                  <div><span>Verified Contribution Mix</span><strong>{data.context.contributionMix}</strong></div>
                  <div><span>Release Readiness</span><strong>{data.context.releaseReadiness.replace(/_/g, " ")}</strong></div>
                  <div><span>Raw Data Exposure</span><strong>{data.context.rawDataExposure}</strong></div>
                  <div><span>Confidential Boundary</span><strong>{data.context.simulatedTeeStatus}</strong></div>
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
