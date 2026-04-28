import { Fragment, useEffect, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import type { NavKey } from "../../../data/types";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorBenchmark } from "../hooks";

interface AuditorBenchmarkViewProps {
  onNavigate: (key: NavKey) => void;
}

export function AuditorBenchmarkView({ onNavigate }: AuditorBenchmarkViewProps) {
  const result = useAuditorBenchmark();
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  useEffect(() => {
    const handleOpenEvidence = () => setIsEvidenceOpen(true);

    window.addEventListener("compass:auditor-open-output-evidence", handleOpenEvidence);
    return () => window.removeEventListener("compass:auditor-open-output-evidence", handleOpenEvidence);
  }, []);

  const handleAction = (title: string) => {
    if (title === "View Benchmark Audit") {
      onNavigate("processing");
      return;
    }

    if (title === "View Audit Trail") {
      onNavigate("position");
      return;
    }

    setIsEvidenceOpen(true);
  };

  return (
    <ViewState result={result} title="Institution Output Audit">
      {(data) => (
        <div className="page-grid">
          <SectionCard
            title="Institution-scoped Derived Output"
            subtitle="Inspect institution-scoped derived output, release eligibility, record lifecycle, and audit-safe handoff state."
          >
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>
          <RoleListSection title="Release / Output Scope" items={data.scope} />
          <RoleListSection title="Output Evidence References" items={data.evidenceRefs.length ? data.evidenceRefs : [data.context.notReadyMessage]} />
          <RoleListSection title="Audit-safe Output Notes" items={data.integrityNotes} />
          <SectionCard title="Auditor Actions">
            <div className="position-action-grid">
              {data.actions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  className="position-action-card auditor-action-button"
                  onClick={() => handleAction(action.title)}
                >
                  <span className="eyebrow">{action.title}</span>
                  <p>{action.body}</p>
                </button>
              ))}
            </div>
          </SectionCard>

          {isEvidenceOpen ? (
            <div className="modal-backdrop" role="presentation">
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="output-evidence-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Read-only Output Evidence Package</span>
                  <h3 id="output-evidence-title">Institution Output Audit Evidence</h3>
                  <p>
                    Auditor-safe summary for the institution-scoped derived output package. Raw institutional contribution
                    data, raw peer positions, named peer breakdowns, and recommendation cards are excluded.
                  </p>
                </div>
                <div className="confirmation-modal__summary">
                  {data.evidencePackage.map((metric) => (
                    <Fragment key={metric.label}>
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </Fragment>
                  ))}
                </div>
                <div className="confirmation-modal__actions">
                  <button type="button" className="secondary-button" onClick={() => setIsEvidenceOpen(false)}>
                    Close
                  </button>
                  <button type="button" className="record-button" onClick={() => onNavigate("processing")}>
                    View Benchmark Audit
                  </button>
                  <button type="button" className="record-button" onClick={() => onNavigate("position")}>
                    View Audit Trail
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
