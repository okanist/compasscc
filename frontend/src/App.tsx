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

export default function App() {
  const [activeNav, setActiveNav] = useState<NavKey>("overview");
  const [role, setRole] = useState<Role>("Institution Desk");
  const [data, setData] = useState<ApiPayload>(fallbackData);
  const [theme, setTheme] = useState<ThemeMode>("night");

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

  let page = <OverviewPage data={data.overview} />;

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
      onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "night" ? "day" : "night"))}
    >
      {page}
    </AppShell>
  );
}
