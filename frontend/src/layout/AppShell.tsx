import type { ReactNode } from "react";
import type { NavKey, Role } from "../data/types";

interface AppShellProps {
  activeNav: NavKey;
  onNavigate: (key: NavKey) => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  children: ReactNode;
}

const navItems: { key: NavKey; label: string }[] = [
  { key: "overview", label: "Network Intelligence Overview" },
  { key: "campaign", label: "Contribution Campaign" },
  { key: "processing", label: "Confidential Processing" },
  { key: "benchmark", label: "Benchmark Intelligence" },
  { key: "position", label: "My Position Intelligence" }
];

const roles: Role[] = ["Institution Desk", "Operator", "Regulator / Auditor"];

export function AppShell({
  activeNav,
  onNavigate,
  role,
  onRoleChange,
  children
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="eyebrow">Compass</span>
          <h1>Canton Repo & Treasury Intelligence</h1>
          <p>Privacy-preserving institutional intelligence for repo and treasury activity on Canton.</p>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === activeNav ? "nav-item nav-item--active" : "nav-item"}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-helper panel">
          <span className="eyebrow">Why Compass Exists</span>
          <p>
            Privacy-first networks protect institutional data, but fragment shared market intelligence.
            Compass closes that gap with controlled contribution, confidential processing, trust-weighted
            aggregation, and auditable benchmark outputs on Canton.
          </p>
        </div>
      </aside>

      <div className="content-column">
        <header className="topbar">
          <div>
            <span className="eyebrow">Compass</span>
            <h2>Institutional Intelligence Console</h2>
          </div>

          <div className="role-switcher panel">
            <label htmlFor="role-select">Active Role</label>
            <select
              id="role-select"
              value={role}
              onChange={(event) => onRoleChange(event.target.value as Role)}
            >
              {roles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>Demo Entity: Alpha Bank</span>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

