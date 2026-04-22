import type { ReactNode } from "react";
import { SectionCard } from "../SectionCard";

export type ViewStatus = "loading" | "ready" | "empty" | "error";

export interface ViewResult<T> {
  status: ViewStatus;
  data?: T;
  message?: string;
}

interface ViewStateProps<T> {
  result: ViewResult<T>;
  title: string;
  emptyMessage?: string;
  errorMessage?: string;
  children: (data: T) => ReactNode;
}

export function ViewState<T>({
  result,
  title,
  emptyMessage = "No role-specific data is available yet.",
  errorMessage = "Compass could not load this role view.",
  children
}: ViewStateProps<T>) {
  if (result.status === "loading") {
    return (
      <SectionCard title={title}>
        <div className="role-state-panel">Loading role view...</div>
      </SectionCard>
    );
  }

  if (result.status === "error") {
    return (
      <SectionCard title={title}>
        <div className="role-state-panel role-state-panel--error">{result.message ?? errorMessage}</div>
      </SectionCard>
    );
  }

  if (result.status === "empty" || !result.data) {
    return (
      <SectionCard title={title}>
        <div className="role-state-panel">{result.message ?? emptyMessage}</div>
      </SectionCard>
    );
  }

  return <>{children(result.data)}</>;
}
