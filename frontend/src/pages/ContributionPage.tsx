import type { CampaignData } from "../data/types";
import type { NavKey } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorContributeView } from "../features/contribute/views/AuditorContributeView";
import { DeskContributeView } from "../features/contribute/views/DeskContributeView";
import { OperatorContributeView } from "../features/contribute/views/OperatorContributeView";

interface ContributionPageProps {
  data: CampaignData;
  role: AppRole;
  onNavigate: (key: NavKey) => void;
}

export function ContributionPage({ data, role, onNavigate }: ContributionPageProps) {
  if (role === "operator") {
    return <OperatorContributeView />;
  }

  if (role === "auditor") {
    return <AuditorContributeView onNavigate={onNavigate} />;
  }

  return <DeskContributeView data={data} />;
}
