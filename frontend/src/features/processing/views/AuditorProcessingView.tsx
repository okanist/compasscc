import { useEffect, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import type { NavKey } from "../../../data/types";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorProcessing } from "../hooks";

interface AuditorProcessingViewProps {
  onNavigate: (key: NavKey) => void;
}

export function AuditorProcessingView({ onNavigate }: AuditorProcessingViewProps) {
  const result = useAuditorProcessing();
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  useEffect(() => {
    const handleOpenEvidence = () => setIsEvidenceOpen(true);

    window.addEventListener("compass:auditor-open-benchmark-evidence", handleOpenEvidence);
    return () => window.removeEventListener("compass:auditor-open-benchmark-evidence", handleOpenEvidence);
  }, []);

  const handleAction = (title: string, outputAuditAvailable: boolean) => {
    if (title === "View Audit Trail") {
      onNavigate("position");
      return;
    }

    if (title === "View Output Audit") {
      if (outputAuditAvailable) {
        onNavigate("benchmark");
      }
      return;
    }

    setIsEvidenceOpen(true);
  };

  return (
    <ViewState result={result} title="Benchmark Release Audit">
      {(data) => (
        <div className="page-grid">
          <SectionCard
            title="Benchmark Snapshot & Release State"
            subtitle="Review released benchmark snapshot, construction quality, processing evidence, retention boundary, and release scope."
          >
            <RoleMetricGrid metrics={data.snapshot} />
          </SectionCard>
          <RoleListSection title="Construction Quality" items={data.constructionQuality} />
          <SectionCard title="Processing Evidence">
            <RoleMetricGrid metrics={data.processingEvidence} />
          </SectionCard>
          <RoleListSection title="Release Scope" items={data.releaseScope} />
          <SectionCard title="Evidence References">
            {data.evidenceReferences.length ? (
              <div className="tag-list">
                {data.evidenceReferences.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <div className="role-state-panel">{data.context.notReadyMessage}</div>
            )}
          </SectionCard>
          <SectionCard title="Auditor Actions">
            <div className="position-action-grid">
              {data.actions.map((action) => {
                const disabled = action.title === "View Output Audit" && !data.context.outputAuditAvailable;

                return (
                  <button
                    key={action.title}
                    type="button"
                    className="position-action-card auditor-action-button"
                    onClick={() => handleAction(action.title, data.context.outputAuditAvailable)}
                    disabled={disabled}
                    title={disabled ? "Output audit is available after benchmark release approval." : undefined}
                  >
                    <span className="eyebrow">{action.title}</span>
                    <p>{disabled ? "Available after benchmark release approval." : action.body}</p>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {isEvidenceOpen ? (
            <div className="modal-backdrop" role="presentation">
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="benchmark-evidence-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Read-only Evidence Package</span>
                  <h3 id="benchmark-evidence-title">Benchmark Release Audit Evidence</h3>
                  <p>
                    Auditor-safe benchmark and processing evidence summary. Raw institutional contributions, peer positions,
                    and package payloads are excluded.
                  </p>
                </div>
                <div className="confirmation-summary">
                  {data.evidencePackage.map((metric) => (
                    <div key={metric.label}>
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="confirmation-modal__actions">
                  <button type="button" className="secondary-button" onClick={() => setIsEvidenceOpen(false)}>
                    Close
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
