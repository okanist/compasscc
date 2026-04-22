import type { ReactNode } from "react";
import { appRoles, roleLabels, type AppRole } from "../types/roles";

type ThemeMode = "night" | "day";

export interface InstitutionTopBarProps {
  title: string;
  description: string;
  role: AppRole;
  onRoleChange: (role: AppRole) => void;
  showRoleSwitcher: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  showModeToggle: boolean;
  confidentialStatusLabel: string;
  confidentialStatusSubtext: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  primaryActionIcon?: ReactNode;
}

export function InstitutionTopBar({
  title,
  description,
  role,
  onRoleChange,
  showRoleSwitcher,
  theme,
  onToggleTheme,
  showModeToggle,
  confidentialStatusLabel,
  confidentialStatusSubtext,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  primaryActionIcon
}: InstitutionTopBarProps) {
  const nextThemeLabel = theme === "night" ? "Day Mode" : "Night Mode";
  const themeDescription = theme === "night" ? "Current: Night" : "Current: Day";

  return (
    <header className="institution-topbar panel">
      <div className="institution-topbar__main">
        <span className="eyebrow">Compass</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="institution-topbar__aside">
        <div className="institution-topbar__utility" aria-label="Top bar utilities">
          {showRoleSwitcher ? (
            <label className="topbar-pill topbar-pill--select" htmlFor="institution-role-select">
              <span className="topbar-pill__label">Role</span>
              <select
                id="institution-role-select"
                value={role}
                onChange={(event) => onRoleChange(event.target.value as AppRole)}
              >
                {appRoles.map((option) => (
                  <option key={option} value={option}>
                    {roleLabels[option]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showModeToggle ? (
            <button
              type="button"
              className="topbar-pill topbar-pill--toggle"
              onClick={onToggleTheme}
              aria-label={nextThemeLabel}
            >
              <span className="topbar-pill__icon" aria-hidden="true">
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
              <span className="topbar-pill__body">
                <strong>{nextThemeLabel}</strong>
                <span>{themeDescription}</span>
              </span>
              <span className={`topbar-pill__track topbar-pill__track--${theme}`} aria-hidden="true">
                <span className="topbar-pill__thumb" />
              </span>
            </button>
          ) : null}
        </div>

        <div className="institution-topbar__actions">
          <div className="institution-status" aria-label="Confidential processing status">
            <span className="institution-status__icon" aria-hidden="true">
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
            <div className="institution-status__body">
              <strong>{confidentialStatusLabel}</strong>
              <span>{confidentialStatusSubtext}</span>
            </div>
          </div>

          {secondaryActionLabel && onSecondaryAction ? (
            <button type="button" className="topbar-button topbar-button--secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </button>
          ) : null}

          <button type="button" className="topbar-button topbar-button--primary" onClick={onPrimaryAction}>
            {primaryActionIcon ? <span className="topbar-button__icon">{primaryActionIcon}</span> : null}
            <span>{primaryActionLabel}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
