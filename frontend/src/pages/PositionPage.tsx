import type { PositionData } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorOutputAuditView } from "../features/my-position/views/AuditorOutputAuditView";
import { DeskMyPositionView } from "../features/my-position/views/DeskMyPositionView";
import { OperatorInstitutionReviewView } from "../features/my-position/views/OperatorInstitutionReviewView";

interface PositionPageProps {
  data: PositionData;
  role: AppRole;
}

export function PositionPage({ data, role }: PositionPageProps) {
  if (role === "operator") {
    return <OperatorInstitutionReviewView />;
  }

  if (role === "auditor") {
    return <AuditorOutputAuditView />;
  }

  return <DeskMyPositionView data={data} />;
}
