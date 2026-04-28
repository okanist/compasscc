import type { PositionData } from "../data/types";
import type { NavKey } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorAuditRecordView } from "../features/my-position/views/AuditorAuditRecordView";
import { DeskMyPositionView } from "../features/my-position/views/DeskMyPositionView";
import { OperatorInstitutionReviewView } from "../features/my-position/views/OperatorInstitutionReviewView";

interface PositionPageProps {
  data: PositionData;
  role: AppRole;
  onNavigate: (key: NavKey) => void;
}

export function PositionPage({ data, role, onNavigate }: PositionPageProps) {
  if (role === "operator") {
    return <OperatorInstitutionReviewView onNavigate={onNavigate} />;
  }

  if (role === "auditor") {
    return <AuditorAuditRecordView onNavigate={onNavigate} />;
  }

  return <DeskMyPositionView data={data} onNavigate={onNavigate} />;
}
