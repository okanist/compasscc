import { SectionCard } from "../../../components/SectionCard";
import { RoleActionGrid, RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useOperatorProcessing } from "../hooks";

export function OperatorProcessingView() {
  const result = useOperatorProcessing();

  return (
    <ViewState result={result} title="Operator Processing Control">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Processing Jobs And Execution State">
            <RoleMetricGrid metrics={data.jobs} />
          </SectionCard>
          <RoleListSection title="Benchmark Run Lifecycle" items={data.lifecycle} />
          <SectionCard title="Operator Actions">
            <RoleActionGrid actions={data.actions} />
            <div className="operator-control-row">
              <button
                type="button"
                className="record-button"
                onClick={() => void result.trigger()}
                disabled={result.actionStatus === "submitting"}
              >
                Trigger Benchmark Processing
              </button>
              <button
                type="button"
                className="record-button"
                onClick={() => void result.approveRelease()}
                disabled={result.actionStatus === "submitting"}
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
        </div>
      )}
    </ViewState>
  );
}
