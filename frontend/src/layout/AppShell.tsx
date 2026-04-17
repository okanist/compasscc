import type { ReactNode } from "react";
import type { NavKey, Role } from "../data/types";

type ThemeMode = "night" | "day";

interface AppShellProps {
  activeNav: NavKey;
  onNavigate: (key: NavKey) => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
  children
}: AppShellProps) {
  const nextThemeLabel = theme === "night" ? "Day Mode" : "Night Mode";
  const themeDescription = theme === "night" ? "Current: Night" : "Current: Day";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div>
              <span className="eyebrow">Compass</span>
              <h1>Canton Repo & Treasury Intelligence</h1>
            </div>
          </div>
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

          <div className="topbar-controls">
            <div className="topbar-status panel">
              <span className="topbar-status__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="presentation">
                  <path
                    d="M7 10V7a5 5 0 0 1 10 0v3m-9 0h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <div>
                <strong>Confidential Processing</strong>
                <span>Raw data retention: none</span>
              </div>
            </div>

            <button type="button" className="theme-switch panel" onClick={onToggleTheme} aria-label={nextThemeLabel}>
              <span className="theme-switch__icon" aria-hidden="true">
                {theme === "night" ? (
                  <svg viewBox="0 0 24 24" role="presentation">
                    <path
                      d="M12 5V2m0 20v-3m7-7h3M2 12h3m11.95 4.95 2.12 2.12M4.93 4.93l2.12 2.12m9.9-2.12-2.12 2.12M7.05 16.95l-2.12 2.12M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" role="presentation">
                    <path
                      d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8a9 9 0 1 0 11.4 11.4Z"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                    />
                  </svg>
                )}
              </span>
              <span className="theme-switch__text">
                <strong>{nextThemeLabel}</strong>
                <span>{themeDescription}</span>
              </span>
              <span className={`theme-switch__track theme-switch__track--${theme}`} aria-hidden="true">
                <span className="theme-switch__thumb" />
              </span>
            </button>

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
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
