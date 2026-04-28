import type { ProcessingData } from "../data/types";
import type { NavKey } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorProcessingView } from "../features/processing/views/AuditorProcessingView";
import { DeskProcessingView } from "../features/processing/views/DeskProcessingView";
import { OperatorProcessingView } from "../features/processing/views/OperatorProcessingView";

interface ProcessingPageProps {
  data: ProcessingData;
  role: AppRole;
  onNavigate: (key: NavKey) => void;
}

export function ProcessingPage({ data, role, onNavigate }: ProcessingPageProps) {
  if (role === "operator") {
    return <OperatorProcessingView onNavigate={onNavigate} />;
  }

  if (role === "auditor") {
    return <AuditorProcessingView onNavigate={onNavigate} />;
  }

  return <DeskProcessingView data={data} onNavigate={onNavigate} />;
}
