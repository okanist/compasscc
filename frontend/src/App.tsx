import { useEffect, useState } from "react";
import { useRole } from "./context/role-context";
import { loadCompassData, resetDemoState } from "./data/api";
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
      primaryActionLabel: "View Audit Trail",
      secondaryActionLabel: "View Audit Package"
    },
    campaign: {
      title: "Policy Evidence",
      description:
        "Inspect contribution policy status, accepted submission classes, attestation rules, retention controls, and enforcement evidence.",
      primaryActionLabel: "Open Evidence Package",
      secondaryActionLabel: "View Audit Trail"
    },
    processing: {
      title: "Benchmark Release Audit",
      description:
        "Review released benchmark snapshot, construction quality, processing evidence, retention boundary, and release scope.",
      primaryActionLabel: "Open Evidence Package",
      secondaryActionLabel: "View Audit Trail"
    },
    benchmark: {
      title: "Institution Output Audit",
      description:
        "Inspect institution-scoped derived output, release eligibility, record lifecycle, and audit-safe handoff state.",
      primaryActionLabel: "Open Output Evidence Package",
      secondaryActionLabel: "View Audit Trail"
    },
    position: {
      title: "Audit Record",
      description:
        "Review finalized Canton-style audit record references, lifecycle state, and read-only audit trail events.",
      primaryActionLabel: "Open Record Package",
      secondaryActionLabel: "Back to Audit Overview"
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
  const [resetVersion, setResetVersion] = useState(0);
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

    if (role === "institution_desk" && activeNav === "benchmark") {
      handleNavigate("position");
      return;
    }

    if (role === "institution_desk" && activeNav === "position") {
      window.dispatchEvent(new CustomEvent("compass:position-primary-action"));
      return;
    }

    if (role === "operator" && activeNav === "overview") {
      if (label === "Trigger Benchmark Run") {
        window.dispatchEvent(new CustomEvent("compass:operator-trigger-processing"));
        return;
      }

      if (label === "Review Submission") {
        window.dispatchEvent(new CustomEvent("compass:operator-review-submissions"));
        return;
      }
    }

    if (role === "operator" && activeNav === "campaign") {
      if (label === "Review Submission") {
        window.dispatchEvent(new CustomEvent("compass:operator-contribution-review"));
        return;
      }

      if (label === "Approve Release") {
        window.dispatchEvent(new CustomEvent("compass:operator-contribution-approve-release"));
        return;
      }
    }

    if (role === "operator" && activeNav === "processing") {
      if (label === "Trigger Benchmark Run") {
        window.dispatchEvent(new CustomEvent("compass:operator-processing-trigger"));
        return;
      }

      if (label === "Approve Release") {
        window.dispatchEvent(new CustomEvent("compass:operator-processing-approve-release"));
        return;
      }
    }

    if (role === "operator" && activeNav === "benchmark") {
      if (label === "Trigger Benchmark Run") {
        window.dispatchEvent(new CustomEvent("compass:operator-benchmark-trigger"));
        return;
      }

      if (label === "Approve Release") {
        window.dispatchEvent(new CustomEvent("compass:operator-benchmark-approve-release"));
        return;
      }
    }

    if (role === "auditor") {
      if (activeNav === "position" && label === "Back to Audit Overview") {
        handleNavigate("overview");
        return;
      }

      if (activeNav === "position" && (label === "Open Record Package" || label === "Open Evidence Package")) {
        window.dispatchEvent(new CustomEvent("compass:auditor-open-record-package"));
        return;
      }

      if (label === "View Audit Trail") {
        handleNavigate("position");
        return;
      }

      if (activeNav === "campaign" && label === "Open Evidence Package") {
        window.dispatchEvent(new CustomEvent("compass:auditor-open-policy-evidence"));
        return;
      }

      if (activeNav === "processing" && (label === "Open Evidence Package" || label === "View Audit Package")) {
        window.dispatchEvent(new CustomEvent("compass:auditor-open-benchmark-evidence"));
        return;
      }

      if (activeNav === "benchmark" && (label === "Open Output Evidence Package" || label === "Open Evidence Package" || label === "View Audit Package")) {
        window.dispatchEvent(new CustomEvent("compass:auditor-open-output-evidence"));
        return;
      }

      if (label === "View Audit Package" || label === "Open Evidence Package") {
        handleNavigate(activeNav === "benchmark" ? "benchmark" : "processing");
        return;
      }
    }

    console.info(`[Compass] ${label}`);
  };

  const handleResetDemoState = async () => {
    await resetDemoState();
    const freshData = await loadCompassData();

    setData(freshData);
    setContributionActionLabel("Submit Contribution");
    setProcessingActionLabel("Submit Contribution");
    setResetVersion((version) => version + 1);
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

  let page = <OverviewPage key={resetVersion} data={data.overview} role={role} onNavigate={handleNavigate} />;

  if (activeNav === "campaign") {
    page = <ContributionPage key={resetVersion} data={data.campaigns[0]} role={role} onNavigate={handleNavigate} />;
  } else if (activeNav === "processing") {
    page = <ProcessingPage key={resetVersion} data={data.processing} role={role} onNavigate={handleNavigate} />;
  } else if (activeNav === "benchmark") {
    page = <BenchmarkPage key={resetVersion} data={data.benchmark} role={role} onNavigate={handleNavigate} />;
  } else if (activeNav === "position") {
    page = <PositionPage key={resetVersion} data={data.position} role={role} onNavigate={handleNavigate} />;
  }

  return (
    <AppShell
      activeNav={activeNav}
      onNavigate={handleNavigate}
      role={role}
      onRoleChange={setRole}
      theme={theme}
      onToggleTheme={toggleTheme}
      onResetDemoState={handleResetDemoState}
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
