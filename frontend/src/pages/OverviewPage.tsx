import type { OverviewData } from "../data/types";
import type { NavKey } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorOverviewView } from "../features/overview/views/AuditorOverviewView";
import { DeskOverviewView } from "../features/overview/views/DeskOverviewView";
import { OperatorOverviewView } from "../features/overview/views/OperatorOverviewView";

interface OverviewPageProps {
  data: OverviewData;
  role: AppRole;
  onNavigate: (key: NavKey) => void;
}

export function OverviewPage({ data, role, onNavigate }: OverviewPageProps) {
  if (role === "operator") {
    return <OperatorOverviewView />;
  }

  if (role === "auditor") {
    return <AuditorOverviewView onNavigate={onNavigate} />;
  }

  return <DeskOverviewView data={data} onNavigate={onNavigate} />;
}
