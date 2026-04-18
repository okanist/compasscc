import { useEffect, useState } from "react";
import { AppShell } from "./layout/AppShell";
import { loadCompassData } from "./data/api";
import { fallbackData } from "./data/fallback";
import type { ApiPayload, NavKey, Role } from "./data/types";
import { OverviewPage } from "./pages/OverviewPage";
import { ContributionPage } from "./pages/ContributionPage";
import { ProcessingPage } from "./pages/ProcessingPage";
import { BenchmarkPage } from "./pages/BenchmarkPage";
import { PositionPage } from "./pages/PositionPage";

type ThemeMode = "night" | "day";
const topBarContent: Record<
  NavKey,
  {
    title: string;
    description: string;
    primaryActionLabel: string;
  }
> = {
  overview: {
    title: "Alpha Bank — Institution Desk",
    description:
      "Compass helps institutions turn private contribution into trusted benchmark intelligence through confidential processing, deterministic analytics, and auditable outputs on Canton.",
    primaryActionLabel: "Generate Executive Brief"
  },
  campaign: {
    title: "Contribution Campaign",
    description:
      "Submit selected benchmark fields under confidential policy controls and attestation-aware contribution rules.",
    primaryActionLabel: "Submit Contribution"
  },
  processing: {
    title: "Confidential Processing",
    description:
      "Review how selected institutional inputs are processed inside the confidential benchmark boundary before derived intelligence is released.",
    primaryActionLabel: "View Attestation Record"
  },
  benchmark: {
    title: "Benchmark Intelligence",
    description:
      "Analyze trust-weighted benchmark signals across the active cohort without exposing institution-level raw positions.",
    primaryActionLabel: "Export Benchmark Snapshot"
  },
  position: {
    title: "My Position Intelligence",
    description:
      "Translate network benchmark context into institution-level interpretation, benchmark deltas, and auditable decision support.",
    primaryActionLabel: "Record to Canton"
  }
};

export default function App() {
  const [activeNav, setActiveNav] = useState<NavKey>("overview");
  const [role, setRole] = useState<Role>("Institution Desk");
  const [data, setData] = useState<ApiPayload>(fallbackData);
  const [theme, setTheme] = useState<ThemeMode>("night");
  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === "night" ? "day" : "night"));

  const handlePrimaryAction = () => {
    console.info(`[Compass] ${topBarContent[activeNav].primaryActionLabel}`);
  };

  useEffect(() => {
    void loadCompassData().then(setData);
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("compass-theme");

    if (savedTheme === "day" || savedTheme === "night") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("compass-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  let page = (
    <OverviewPage
      data={data.overview}
    />
  );

  if (activeNav === "campaign") {
    page = <ContributionPage data={data.campaigns[0]} />;
  } else if (activeNav === "processing") {
    page = <ProcessingPage data={data.processing} />;
  } else if (activeNav === "benchmark") {
    page = <BenchmarkPage data={data.benchmark} />;
  } else if (activeNav === "position") {
    page = <PositionPage data={data.position} />;
  }

  return (
    <AppShell
      activeNav={activeNav}
      onNavigate={setActiveNav}
      role={role}
      onRoleChange={setRole}
      theme={theme}
      onToggleTheme={toggleTheme}
      topBar={{
        ...topBarContent[activeNav],
        showRoleSwitcher: true,
        showModeToggle: true,
        confidentialStatusLabel: "Confidential Processing",
        confidentialStatusSubtext:
          activeNav === "overview" ? "Private benchmark boundary active" : "Raw data retention: none",
        onPrimaryAction: handlePrimaryAction
      }}
    >
      {page}
    </AppShell>
  );
}
