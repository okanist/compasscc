import { useEffect, useState } from "react";
import { SectionCard } from "../../../components/SectionCard";
import type { NavKey } from "../../../data/types";
import { RoleListSection, RoleMetricGrid } from "../../../components/primitives/RoleViewSections";
import { ViewState } from "../../../components/primitives/ViewState";
import { useAuditorContribute } from "../hooks";

interface AuditorContributeViewProps {
  onNavigate: (key: NavKey) => void;
}

export function AuditorContributeView({ onNavigate }: AuditorContributeViewProps) {
  const result = useAuditorContribute();
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  useEffect(() => {
    const handleOpenEvidence = () => setIsEvidenceOpen(true);

    window.addEventListener("compass:auditor-open-policy-evidence", handleOpenEvidence);
    return () => window.removeEventListener("compass:auditor-open-policy-evidence", handleOpenEvidence);
  }, []);

  const handleAction = (title: string) => {
    if (title === "View Audit Trail") {
      onNavigate("position");
      return;
    }

    setIsEvidenceOpen(true);
  };

  return (
    <ViewState result={result} title="Policy Evidence">
      {(data) => (
        <div className="page-grid">
          <SectionCard title="Contribution Policy Evidence" subtitle="Read-only auditor evidence for accepted submission classes, attestation rules, retention controls, and policy enforcement state.">
            <div className={data.evidenceContext.releasedCycle ? "contribution-status-panel" : "contribution-status-panel contribution-status-panel--error"}>
              <strong>{data.evidenceContext.releasedCycle ? "Policy evidence enforced for released cycle" : "Policy configured; release evidence pending"}</strong>
              <p>{data.evidenceContext.message}</p>
            </div>
            <RoleMetricGrid metrics={data.policy} />
          </SectionCard>
          <RoleListSection
            title="Accepted Submission Classes"
            subtitle="Oracle and custodian classes are policy-recognized in the MVP; this screen does not imply live external integration."
            items={data.classes}
          />
          <RoleListSection title="Retention Controls And Policy Rules" items={data.controls} />
          <RoleListSection title="Class-To-Benchmark Weight Mapping" items={data.weightMapping} />
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
              <div className="confirmation-modal panel" role="dialog" aria-modal="true" aria-labelledby="policy-evidence-title">
                <div className="confirmation-modal__header">
                  <span className="eyebrow">Policy Evidence Package</span>
                  <h3 id="policy-evidence-title">Contribution Policy Evidence</h3>
                  <p>
                    Read-only evidence summary for contribution policy configuration and enforcement. No raw institution
                    or peer contribution values are included.
                  </p>
                </div>
                <div className="confirmation-summary">
                  <div>
                    <span>Campaign</span>
                    <strong>{data.evidenceContext.campaignTitle ?? "Active campaign"}</strong>
                  </div>
                  <div>
                    <span>Scenario</span>
                    <strong>{data.evidenceContext.scenario ?? "Active scenario"}</strong>
                  </div>
                  <div>
                    <span>Policy Status</span>
                    <strong>{data.evidenceContext.policyStatus ?? "Active"}</strong>
                  </div>
                  <div>
                    <span>Accepted Classes</span>
                    <strong>{data.evidenceContext.acceptedClassesCount ?? data.classes.length}</strong>
                  </div>
                  <div>
                    <span>Submitted Packages</span>
                    <strong>{data.evidenceContext.submittedPackages ?? 0}</strong>
                  </div>
                  <div>
                    <span>Pending Reviews</span>
                    <strong>{data.evidenceContext.pendingReviews ?? 0}</strong>
                  </div>
                  <div>
                    <span>Released Cycle</span>
                    <strong>{data.evidenceContext.releasedCycle ? "Yes" : "No"}</strong>
                  </div>
                  <div>
                    <span>Raw Data Exposure</span>
                    <strong>None</strong>
                  </div>
                  <div>
                    <span>Record Lifecycle</span>
                    <strong>{String(data.evidenceContext.recordLifecycle ?? "not_finalized").replace(/_/g, " ")}</strong>
                  </div>
                  <div>
                    <span>Record Reference</span>
                    <strong>{data.evidenceContext.recordReference ?? "Pending"}</strong>
                  </div>
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
