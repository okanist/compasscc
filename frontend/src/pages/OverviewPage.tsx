import type { OverviewData } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorOverviewView } from "../features/overview/views/AuditorOverviewView";
import { DeskOverviewView } from "../features/overview/views/DeskOverviewView";
import { OperatorOverviewView } from "../features/overview/views/OperatorOverviewView";

interface OverviewPageProps {
  data: OverviewData;
  role: AppRole;
}

export function OverviewPage({ data, role }: OverviewPageProps) {
  if (role === "operator") {
    return <OperatorOverviewView />;
  }

  if (role === "auditor") {
    return <AuditorOverviewView />;
  }

  return <DeskOverviewView data={data} />;
}
