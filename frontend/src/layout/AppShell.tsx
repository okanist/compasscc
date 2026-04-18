import type { ReactNode } from "react";
import { InstitutionTopBar, type InstitutionTopBarProps } from "../components/InstitutionTopBar";
import type { NavKey, Role } from "../data/types";

type ThemeMode = "night" | "day";

interface AppShellProps {
  activeNav: NavKey;
  onNavigate: (key: NavKey) => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  topBar: Omit<
    InstitutionTopBarProps,
    "role" | "onRoleChange" | "theme" | "onToggleTheme"
  >;
  children: ReactNode;
}

const navItems: { key: NavKey; label: string; icon: ReactNode }[] = [
  {
    key: "overview",
    label: "Intelligence Overview",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation">
        <path
          d="M12 3.75 19.25 7.5v9L12 20.25 4.75 16.5v-9L12 3.75Zm0 0v16.5M4.75 7.5 12 12l7.25-4.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.55"
        />
      </svg>
    )
  },
  {
    key: "campaign",
    label: "Contribute Data",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation">
        <path
          d="M7 5.75h10a1.75 1.75 0 0 1 1.75 1.75v9A1.75 1.75 0 0 1 17 18.25H7A1.75 1.75 0 0 1 5.25 16.5v-9A1.75 1.75 0 0 1 7 5.75Zm3.5-2v4.5m3-4.5v4.5M8.5 11.25h7m-7 3h4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.55"
        />
      </svg>
    )
  },
  {
    key: "processing",
    label: "Confidential Processing",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation">
        <path
          d="M8 10V7.75a4 4 0 1 1 8 0V10m-8 0h8a1.75 1.75 0 0 1 1.75 1.75v6.5A1.75 1.75 0 0 1 16 20H8A1.75 1.75 0 0 1 6.25 18.25v-6.5A1.75 1.75 0 0 1 8 10Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.55"
        />
      </svg>
    )
  },
  {
    key: "benchmark",
    label: "Benchmark & Insights",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation">
        <path
          d="M6.25 17.75h2.5v-5h-2.5v5Zm4.5 0h2.5V6.25h-2.5v11.5Zm4.5 0h2.5v-8h-2.5v8Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.55"
        />
      </svg>
    )
  },
  {
    key: "position",
    label: "My Position",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation">
        <path
          d="M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Zm-6.75 6.25a6.75 6.75 0 0 1 13.5 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.55"
        />
      </svg>
    )
  }
];

export function AppShell({
  activeNav,
  onNavigate,
  role,
  onRoleChange,
  theme,
  onToggleTheme,
  topBar,
  children
}: AppShellProps) {
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
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === activeNav ? "nav-item nav-item--active" : "nav-item"}
              onClick={() => onNavigate(item.key)}
            >
              <span className="nav-item__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-utility-row" aria-label="Sidebar utilities">
            <button type="button" className="sidebar-utility-button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" role="presentation">
                <path
                  d="M12 5.5a4 4 0 0 0-4 4v2.25c0 .8-.27 1.58-.77 2.21L6 15.5h12l-1.23-1.54a3.5 3.5 0 0 1-.77-2.21V9.5a4 4 0 0 0-4-4Zm-1.75 12.5a1.75 1.75 0 0 0 3.5 0"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.55"
                />
              </svg>
            </button>
            <button type="button" className="sidebar-utility-button" aria-label="Settings">
              <svg viewBox="0 0 24 24" role="presentation">
                <path
                  d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm6 2.5-.92-.53a.8.8 0 0 1-.38-.88l.2-.97-1.4-1.4-.97.2a.8.8 0 0 1-.88-.38L13.12 7h-2.24l-.53.92a.8.8 0 0 1-.88.38l-.97-.2-1.4 1.4.2.97a.8.8 0 0 1-.38.88L6 12l.92.53a.8.8 0 0 1 .38.88l-.2.97 1.4 1.4.97-.2a.8.8 0 0 1 .88.38l.53.92h2.24l.53-.92a.8.8 0 0 1 .88-.38l.97.2 1.4-1.4-.2-.97a.8.8 0 0 1 .38-.88L18 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.45"
                />
              </svg>
            </button>
          </div>

          <div className="sidebar-profile">
            <div className="sidebar-profile__avatar">AB</div>
            <div>
              <strong>Alpha Bank</strong>
              <span>Institution Desk</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="content-column">
        <InstitutionTopBar
          {...topBar}
          role={role}
          onRoleChange={onRoleChange}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
