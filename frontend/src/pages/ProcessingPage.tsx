import type { ProcessingData } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorProcessingView } from "../features/processing/views/AuditorProcessingView";
import { DeskProcessingView } from "../features/processing/views/DeskProcessingView";
import { OperatorProcessingView } from "../features/processing/views/OperatorProcessingView";

interface ProcessingPageProps {
  data: ProcessingData;
  role: AppRole;
}

export function ProcessingPage({ data, role }: ProcessingPageProps) {
  if (role === "operator") {
    return <OperatorProcessingView />;
  }

  if (role === "auditor") {
    return <AuditorProcessingView />;
  }

  return <DeskProcessingView data={data} />;
}
