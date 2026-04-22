import type { BenchmarkData } from "../data/types";
import type { AppRole } from "../types/roles";
import { AuditorBenchmarkView } from "../features/benchmark/views/AuditorBenchmarkView";
import { DeskBenchmarkView } from "../features/benchmark/views/DeskBenchmarkView";
import { OperatorBenchmarkView } from "../features/benchmark/views/OperatorBenchmarkView";

interface BenchmarkPageProps {
  data: BenchmarkData;
  role: AppRole;
}

export function BenchmarkPage({ data, role }: BenchmarkPageProps) {
  if (role === "operator") {
    return <OperatorBenchmarkView />;
  }

  if (role === "auditor") {
    return <AuditorBenchmarkView />;
  }

  return <DeskBenchmarkView data={data} />;
}
