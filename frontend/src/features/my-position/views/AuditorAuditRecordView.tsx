import { useEffect, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import type { NavKey } from "../../../data/types";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorAuditRecord } from "../hooks";

interface AuditorAuditRecordViewProps {
  onNavigate: (key: NavKey) => void;
}

export function AuditorAuditRecordView({ onNavigate }: AuditorAuditRecordViewProps) {
  const result = useAuditorAuditRecord();
  const [isRecordPackageOpen, setIsRecordPackageOpen] = useState(false);

  useEffect(() => {
    const handleOpenRecordPackage = () => setIsRecordPackageOpen(true);

    window.addEventListener("compass:auditor-open-record-package", handleOpenRecordPackage);
    return () => window.removeEventListener("compass:auditor-open-record-package", handleOpenRecordPackage);
  }, []);

  const handleAction = (title: string) => {
    if (title === "View Benchmark Audit") {
      onNavigate("processing");
      return;
    }

    if (title === "View Output Audit") {
      onNavigate("benchmark");
      return;
    }

    if (title === "Back to Audit Overview") {
      onNavigate("overview");
      return;
    }

    setIsRecordPackageOpen(true);
  };

  return (
    <ViewState result={result} title="Audit Record">
      {(data) => (
        <div className="page-grid">
          <SectionCard
            title="Audit Record"
            subtitle="Review finalized Canton-style audit record references, lifecycle state, and read-only audit trail events."
          >
            <div className={data.context.finalized ? "contribution-status-panel" : "contribution-status-panel contribution-status-panel--error"}>
              <strong>{data.context.finalized ? "Canton-style audit record finalized" : "Audit record not finalized yet"}</strong>
              <p>{data.context.lifecycleMessage}</p>
            </div>
            <RoleMetricGrid metrics={data.metrics} />
          </SectionCard>

          <RoleListSection title="Release / Record Scope" items={data.releaseScope} />
          <RoleListSection title="Audit Trail Events" items={data.auditTrail} />
          <RoleListSection title="Evidence References" items={data.evidenceRefs} />
          <RoleListSection title="Raw Data Safety Notes" items={data.integrityNotes} />

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

          {isRecordPackageOpen ? (
            <div className="modal-backdrop" role="presentation">
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="record-package-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Read-only Record Package</span>
                  <h3 id="record-package-title">Audit Record Package</h3>
                  <p>
                    Auditor-safe record summary with lifecycle references only. Raw institutional contribution values,
                    peer positions, named peer breakdowns, and payload dumps are excluded.
                  </p>
                </div>
                <div className="confirmation-summary">
                  {data.recordPackage.map((metric) => (
                    <div key={metric.label}>
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="confirmation-modal__actions">
                  <button type="button" className="secondary-button" onClick={() => setIsRecordPackageOpen(false)}>
                    Close
                  </button>
                  <button type="button" className="record-button" onClick={() => onNavigate("processing")}>
                    View Benchmark Audit
                  </button>
                  <button type="button" className="record-button" onClick={() => onNavigate("benchmark")}>
                    View Output Audit
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
