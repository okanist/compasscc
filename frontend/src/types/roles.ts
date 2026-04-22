export type AppRole = "institution_desk" | "operator" | "auditor";

export const appRoles: AppRole[] = ["institution_desk", "operator", "auditor"];

export const roleLabels: Record<AppRole, string> = {
  institution_desk: "Institution Desk",
  operator: "Operator",
  auditor: "Auditor"
};

export function isAppRole(value: string | null): value is AppRole {
  return value === "institution_desk" || value === "operator" || value === "auditor";
}
