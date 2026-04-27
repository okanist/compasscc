import { useEffect, useState } from "react";
import { useRole } from "./context/role-context";
import { loadCompassData } from "./data/api";
import { fallbackData } from "./data/fallback";
import type { ApiPayload, NavKey } from "./data/types";
import { AppShell } from "./layout/AppShell";
import { BenchmarkPage } from "./pages/BenchmarkPage";
import { ContributionPage } from "./pages/ContributionPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PositionPage } from "./pages/PositionPage";
import { ProcessingPage } from "./pages/ProcessingPage";
import type { AppRole } from "./types/roles";

type ThemeMode = "night" | "day";

interface TopBarContent {
  title: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
}

const navRoutes: Record<NavKey, string> = {
  overview: "/overview",
  campaign: "/contribute",
  processing: "/processing",
  benchmark: "/benchmark",
  position: "/my-position"
};

const pathToNav: Record<string, NavKey> = {
  "/": "overview",
  "/overview": "overview",
  "/contribute": "campaign",
  "/processing": "processing",
  "/benchmark": "benchmark",
  "/my-position": "position"
};

function getNavFromPath(pathname: string): NavKey {
  return pathToNav[pathname] ?? "overview";
}

const topBarContent: Record<AppRole, Record<NavKey, TopBarContent>> = {
  institution_desk: {
    overview: {
      title: "Alpha Bank - Institution Desk",
      description:
        "Compass helps institutions turn private contribution into trusted benchmark intelligence through confidential processing, deterministic analytics, and auditable outputs on Canton.",
      primaryActionLabel: "Compare to My Position",
      secondaryActionLabel: "Submit Contribution"
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
      primaryActionLabel: "Compare to My Position"
    },
    position: {
      title: "My Position Intelligence",
      description:
        "Translate network benchmark context into institution-level interpretation, benchmark deltas, and auditable decision support.",
      primaryActionLabel: "Record to Canton"
    }
  },
  operator: {
    overview: {
      title: "Compass Operator Console",
      description:
        "Monitor active campaigns, contributor depth, validation state, benchmark reliability, and processing health from the shared Compass shell.",
      primaryActionLabel: "Trigger Benchmark Run",
      secondaryActionLabel: "Review Submission"
    },
    campaign: {
      title: "Contribution Operations",
      description:
        "Configure campaigns, track participation, review contribution quality, and move validated submissions toward processing.",
      primaryActionLabel: "Review Submission",
      secondaryActionLabel: "Approve Release"
    },
    processing: {
      title: "Processing Run Control",
      description:
        "Track confidential processing jobs, execution states, benchmark lifecycle markers, retries, and release readiness.",
      primaryActionLabel: "Trigger Benchmark Run",
      secondaryActionLabel: "Approve Release"
    },
    benchmark: {
      title: "Benchmark Operations",
      description:
        "Review scenario-wide metrics, cohort depth, contribution mix, construction quality, and benchmark release history.",
      primaryActionLabel: "Trigger Benchmark Run",
      secondaryActionLabel: "Approve Release"
    },
    position: {
      title: "Institution Output Review",
      description:
        "Review selected institution outputs, benchmark deltas, release eligibility, confidence, and handoff readiness.",
      primaryActionLabel: "Approve Release",
      secondaryActionLabel: "Review Submission"
    }
  },
  auditor: {
    overview: {
      title: "Compass Audit Review",
      description:
        "Review reliability, attestation coverage, release scope, retention compliance, and audit trail status across the benchmark cycle.",
      primaryActionLabel: "View Audit Package",
      secondaryActionLabel: "View Audit Trail"
    },
    campaign: {
      title: "Contribution Policy Audit",
      description:
        "Inspect contribution policy, accepted submission classes, attestation rules, retention controls, and enforcement state.",
      primaryActionLabel: "Open Evidence Package",
      secondaryActionLabel: "View Audit Trail"
    },
    processing: {
      title: "Processing Evidence Review",
      description:
        "Review runtime guarantees, attestation chain, disclosure boundary, retention enforcement, and evidence references.",
      primaryActionLabel: "Open Evidence Package",
      secondaryActionLabel: "View Audit Trail"
    },
    benchmark: {
      title: "Benchmark Audit Review",
      description:
        "Inspect methodology, reliability, attested coverage, released output scope, and benchmark audit notes.",
      primaryActionLabel: "View Audit Package",
      secondaryActionLabel: "View Audit Trail"
    },
    position: {
      title: "Institution Output Audit",
      description:
        "Audit institution-scoped released output, attestation-linked summaries, included and excluded scope, record references, and trail events.",
      primaryActionLabel: "Open Evidence Package",
      secondaryActionLabel: "View Audit Trail"
    }
  }
};

export default function App() {
  const [activeNav, setActiveNav] = useState<NavKey>(() => getNavFromPath(window.location.pathname));
  const { role, setRole } = useRole();
  const [data, setData] = useState<ApiPayload>(fallbackData);
  const [theme, setTheme] = useState<ThemeMode>("night");
  const [contributionActionLabel, setContributionActionLabel] = useState("Submit Contribution");
  const [processingActionLabel, setProcessingActionLabel] = useState("Submit Contribution");
  const activeTopBar = topBarContent[role][activeNav];
  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === "night" ? "day" : "night"));

  const handleNavigate = (key: NavKey) => {
    setActiveNav(key);
    window.history.pushState(null, "", navRoutes[key]);
  };

  const handleTopBarAction = (label: string) => {
    if (role === "institution_desk" && activeNav === "overview") {
      if (label === "Submit Contribution") {
        handleNavigate("campaign");
        return;
      }

      if (label === "Compare to My Position") {
        handleNavigate("position");
        return;
      }
    }

    if (role === "institution_desk" && activeNav === "campaign") {
      window.dispatchEvent(new CustomEvent("compass:submit-contribution"));
      return;
    }

    if (role === "institution_desk" && activeNav === "processing") {
      window.dispatchEvent(new CustomEvent("compass:processing-primary-action"));
      return;
    }

    console.info(`[Compass] ${label}`);
  };

  useEffect(() => {
    void loadCompassData().then(setData);
  }, []);

  useEffect(() => {
    const handlePopState = () => setActiveNav(getNavFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
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

  useEffect(() => {
    const handleContributionLabel = (event: Event) => {
      const label = (event as CustomEvent<{ label?: string }>).detail?.label;

      if (label) {
        setContributionActionLabel(label);
      }
    };

    window.addEventListener("compass:contribution-action-label", handleContributionLabel);
    return () => window.removeEventListener("compass:contribution-action-label", handleContributionLabel);
  }, []);

  useEffect(() => {
    const handleProcessingLabel = (event: Event) => {
      const label = (event as CustomEvent<{ label?: string }>).detail?.label;

      if (label) {
        setProcessingActionLabel(label);
      }
    };

    window.addEventListener("compass:processing-action-label", handleProcessingLabel);
    return () => window.removeEventListener("compass:processing-action-label", handleProcessingLabel);
  }, []);

  let page = <OverviewPage data={data.overview} role={role} onNavigate={handleNavigate} />;

  if (activeNav === "campaign") {
    page = <ContributionPage data={data.campaigns[0]} role={role} />;
  } else if (activeNav === "processing") {
    page = <ProcessingPage data={data.processing} role={role} onNavigate={handleNavigate} />;
  } else if (activeNav === "benchmark") {
    page = <BenchmarkPage data={data.benchmark} role={role} />;
  } else if (activeNav === "position") {
    page = <PositionPage data={data.position} role={role} />;
  }

  return (
    <AppShell
      activeNav={activeNav}
      onNavigate={handleNavigate}
      role={role}
      onRoleChange={setRole}
      theme={theme}
      onToggleTheme={toggleTheme}
      topBar={{
        ...activeTopBar,
        primaryActionLabel:
          role === "institution_desk" && activeNav === "campaign"
            ? contributionActionLabel
            : role === "institution_desk" && activeNav === "processing"
              ? processingActionLabel
            : activeTopBar.primaryActionLabel,
        showRoleSwitcher: true,
        showModeToggle: true,
        confidentialStatusLabel: "Confidential Processing",
        confidentialStatusSubtext:
          role === "operator"
            ? "Operations boundary active"
            : role === "auditor"
              ? "Evidence boundary available"
              : activeNav === "overview"
                ? "Private benchmark boundary active"
                : "Raw data retention: none",
        onPrimaryAction: () => handleTopBarAction(activeTopBar.primaryActionLabel),
        onSecondaryAction: activeTopBar.secondaryActionLabel
          ? () => handleTopBarAction(activeTopBar.secondaryActionLabel as string)
          : undefined
      }}
    >
      {page}
    </AppShell>
  );
}
