import type { CampaignData } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorContributeView } from "../features/contribute/views/AuditorContributeView";
import { DeskContributeView } from "../features/contribute/views/DeskContributeView";
import { OperatorContributeView } from "../features/contribute/views/OperatorContributeView";

interface ContributionPageProps {
  data: CampaignData;
  role: AppRole;
}

export function ContributionPage({ data, role }: ContributionPageProps) {
  if (role === "operator") {
    return <OperatorContributeView />;
  }

  if (role === "auditor") {
    return <AuditorContributeView />;
  }

  return <DeskContributeView data={data} />;
}
