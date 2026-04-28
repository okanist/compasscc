import type { BenchmarkData } from "../data/types";
import type { NavKey } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorBenchmarkView } from "../features/benchmark/views/AuditorBenchmarkView";
import { DeskBenchmarkView } from "../features/benchmark/views/DeskBenchmarkView";
import { OperatorBenchmarkView } from "../features/benchmark/views/OperatorBenchmarkView";

interface BenchmarkPageProps {
  data: BenchmarkData;
  role: AppRole;
  onNavigate: (key: NavKey) => void;
}

export function BenchmarkPage({ data, role, onNavigate }: BenchmarkPageProps) {
  if (role === "operator") {
    return <OperatorBenchmarkView onNavigate={onNavigate} />;
  }

  if (role === "auditor") {
    return <AuditorBenchmarkView onNavigate={onNavigate} />;
  }

  return <DeskBenchmarkView data={data} onNavigate={onNavigate} />;
}
