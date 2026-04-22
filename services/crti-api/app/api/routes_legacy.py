from fastapi import APIRouter

from .deps import get_repository

router = APIRouter(tags=["legacy"])


@router.get("/")
def root():
    return {
        "service": "Compass API",
        "status": "ok",
        "message": "Compass projection and role-view service is running.",
    }


@router.get("/overview")
def get_overview():
    return {
        "kpis": [
            {"label": "Total Contributors", "value": "28"},
            {"label": "Attested Contributors", "value": "19"},
            {"label": "Benchmark Reliability", "value": "91.4%", "tone": "positive"},
            {"label": "Active Intelligence Campaigns", "value": "3"},
            {"label": "Network Liquidity Status", "value": "Stable"},
            {"label": "Dispersion Level", "value": "Elevated", "tone": "warning"},
            {"label": "Incentive Status", "value": "Reward Window Open", "tone": "positive"},
        ],
        "informationBand": {
            "title": "Privacy-Preserving Institutional Contribution",
            "body": "Institutions contribute selected fields under policy. Raw positions never leave the confidential boundary.",
        },
        "processStrip": [
            "Private Contribution",
            "Confidential Processing",
            "Trust-Weighted Benchmark",
            "Position Intelligence",
            "Auditable Output",
        ],
    }


@router.get("/campaigns")
def get_campaigns():
    campaign = get_repository().get_campaign(1)
    return [
        {
            "title": campaign.title,
            "scenario": "Tier-1 Canton treasury desks with active repo settlement flows",
            "requestedFields": campaign.requested_fields_json,
            "minimumReputationThreshold": "0.78 network trust score",
            "contributionReward": "Benchmark access uplift + campaign incentive credit",
            "contributionTypes": ["Self-reported", "System-signed", "Oracle / custodian-attested"],
            "policySummary": "System-signed and custodian-attested submissions receive higher benchmark weight than self-reported entries.",
            "participationStatus": "Submitted and awaiting operator validation",
            "contributorQualityTier": "Tier A-",
            "confidenceTier": "High",
            "teeProcessingEnabled": "Yes",
        }
    ]


@router.get("/processing")
def get_processing():
    run = get_repository().get_run(1)
    return {
        "headline": "Raw data goes in. Only intelligence comes out.",
        "body": "Compass uses confidential processing to ingest contribution fields inside a controlled environment.",
        "steps": [
            {"label": "Raw institutional data received", "value": "Selected contribution fields accepted under campaign policy"},
            {"label": "Processed inside confidential environment", "value": "TEE-enabled execution boundary"},
            {"label": "Persistent storage disabled", "value": "No raw payload persistence outside runtime"},
            {"label": "Deterministic engine executed", "value": "Benchmark, reliability, and dispersion metrics computed"},
            {"label": "Local explainer enabled", "value": "Summary layer restates computed outputs only"},
            {"label": "Derived outputs generated", "value": "Benchmark package and institution-scoped comparison"},
            {"label": "Attestation reference", "value": run.attestation_ref},
            {"label": "Raw data retention", "value": "None"},
        ],
    }


@router.get("/benchmark")
def get_benchmark():
    snapshot = get_repository().get_snapshot(1)
    return {
        "scenarioOptions": ["Repo", "Treasury", "Repo with Treasury Collateral"],
        "selectedScenario": snapshot.scenario,
        "primaryMetrics": [
            {"label": "Average Liquidity", "value": f"{snapshot.average_liquidity:.1f} / 100"},
            {"label": "Average Repo Rate", "value": f"{snapshot.average_repo_rate:.2f}%"},
            {"label": "Average Haircut", "value": f"{snapshot.average_haircut:.1f}%"},
            {"label": "Aggregate Notional", "value": "$1.42B"},
            {"label": "Contributor Count", "value": str(snapshot.contributor_count)},
            {"label": "Trust-Weighted Benchmark Score", "value": f"{snapshot.benchmark_score:.1f}"},
            {"label": "Liquidity Dispersion", "value": f"{snapshot.dispersion:.1f} pts"},
            {"label": "Benchmark Reliability", "value": f"{snapshot.reliability_score:.1f}%"},
        ],
        "secondaryMetrics": [{"label": label, "value": value} for label, value in snapshot.secondary_metrics_json.items()],
        "alerts": snapshot.alerts_json,
    }


@router.get("/position")
def get_position():
    output = get_repository().get_output(1)
    return {
        "metrics": [
            {"label": "My Liquidity Score", "value": f"{output.my_liquidity_score:.1f} / 100"},
            {"label": "Network Average", "value": f"{output.network_average:.1f} / 100"},
            {"label": "Delta vs Benchmark", "value": f"{output.delta_vs_benchmark:+.1f} pts"},
            {"label": "Risk Tier", "value": output.risk_tier},
            {"label": "Confidence Level", "value": output.confidence_level},
            {"label": "Collateral Structure", "value": output.collateral_structure},
            {"label": "Maturity Bucket", "value": output.maturity_bucket},
        ],
        "suggestedInterpretation": output.suggested_interpretation,
        "explainableSummary": output.explainable_summary,
    }


@router.get("/explainable-summary")
def get_explainable_summary():
    return {"text": get_repository().get_output(1).explainable_summary}
