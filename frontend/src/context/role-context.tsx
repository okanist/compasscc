import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isAppRole, type AppRole } from "../types/roles";

interface RoleContextValue {
  role: AppRole;
  setRole: (role: AppRole) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);
const storageKey = "compass-role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>(() => {
    if (typeof window === "undefined") {
      return "institution_desk";
    }

    const savedRole = window.localStorage.getItem(storageKey);
    return isAppRole(savedRole) ? savedRole : "institution_desk";
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, role);
  }, [role]);

  const value = useMemo(() => ({ role, setRole }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used inside RoleProvider");
  }

  return context;
}
