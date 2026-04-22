from statistics import mean, pstdev
from typing import Any

from ..schemas import BenchmarkSnapshotDTO, ContributionSubmissionDTO


class ReliabilityScoringService:
    def score(
        self,
        *,
        attested_coverage: float,
        contributor_depth: int,
        trust_class_mix: dict[str, int],
        confidence_tier: str,
    ) -> float:
        depth_score = min(contributor_depth / 30, 1.0) * 30
        attestation_score = attested_coverage * 40
        verified_count = trust_class_mix.get("System-signed", 0) + trust_class_mix.get("Oracle / custodian-attested", 0)
        mix_total = max(sum(trust_class_mix.values()), 1)
        mix_score = (verified_count / mix_total) * 20
        confidence_score = {"High": 10, "Medium": 6, "Low": 2}.get(confidence_tier, 4)
        return round(depth_score + attestation_score + mix_score + confidence_score, 1)


class AlertsService:
    def generate(self, *, average_liquidity: float, dispersion: float, average_haircut: float) -> list[str]:
        alerts: list[str] = []
        if average_liquidity >= 70:
            alerts.append("LIQUIDITY_OK")
        if dispersion >= 10:
            alerts.append("ELEVATED_DISPERSION")
        if average_haircut >= 2.75:
            alerts.append("HAIRCUT_STRESS_SIGNAL")
        return alerts


class BenchmarkComputationService:
    def __init__(self, reliability: ReliabilityScoringService, alerts: AlertsService) -> None:
        self.reliability = reliability
        self.alerts = alerts

    def compute_snapshot(
        self,
        *,
        snapshot_id: int,
        processing_run_id: int,
        campaign_id: int,
        scenario: str,
        submissions: list[ContributionSubmissionDTO],
        created_at,
    ) -> BenchmarkSnapshotDTO:
        payloads: list[dict[str, Any]] = [item.payload_json for item in submissions]
        liquidity = [float(item.get("liquidity_score", 0)) for item in payloads]
        repo_rates = [float(item.get("repo_rate", 0)) for item in payloads]
        haircuts = [float(item.get("haircut", 0)) for item in payloads]
        notionals = [float(item.get("notional", 0)) for item in payloads]
        contributor_count = len(submissions)
        attested_count = len([item for item in submissions if item.attestation_status in {"system_signed", "external_attested"}])
        attested_coverage = round(attested_count / max(contributor_count, 1), 2)
        average_liquidity = round(mean(liquidity), 1) if liquidity else 0
        average_repo_rate = round(mean(repo_rates), 2) if repo_rates else 0
        average_haircut = round(mean(haircuts), 2) if haircuts else 0
        aggregate_notional = round(sum(notionals), 2)
        dispersion = round(pstdev(liquidity), 1) if len(liquidity) > 1 else 0
        trust_class_mix: dict[str, int] = {}
        for submission in submissions:
            trust_class_mix[submission.submission_type] = trust_class_mix.get(submission.submission_type, 0) + 1
        reliability_score = self.reliability.score(
            attested_coverage=attested_coverage,
            contributor_depth=contributor_count,
            trust_class_mix=trust_class_mix,
            confidence_tier="High",
        )
        benchmark_score = round((average_liquidity * 0.72) + (reliability_score * 0.28), 1)

        return BenchmarkSnapshotDTO(
            id=snapshot_id,
            processing_run_id=processing_run_id,
            campaign_id=campaign_id,
            scenario=scenario,
            contributor_count=contributor_count,
            attested_coverage=attested_coverage,
            average_liquidity=average_liquidity,
            average_repo_rate=average_repo_rate,
            average_haircut=average_haircut,
            aggregate_notional=aggregate_notional,
            benchmark_score=benchmark_score,
            dispersion=dispersion,
            reliability_score=reliability_score,
            secondary_metrics_json={},
            alerts_json=self.alerts.generate(
                average_liquidity=average_liquidity,
                dispersion=dispersion,
                average_haircut=average_haircut,
            ),
            distribution_json={"median": average_liquidity},
            created_at=created_at,
        )


class InstitutionComparisonService:
    def compare(self, *, liquidity_score: float, benchmark_average: float, reliability_score: float) -> dict[str, str | float]:
        delta = round(liquidity_score - benchmark_average, 1)
        if delta < -7:
            risk_tier = "Elevated Watch"
        elif delta < 0:
            risk_tier = "Contained Watch"
        else:
            risk_tier = "Outperforming"
        confidence_level = "High" if reliability_score >= 85 else "Medium" if reliability_score >= 70 else "Low"
        position_band = "below_benchmark" if delta < 0 else "above_benchmark"
        return {
            "delta_vs_benchmark": delta,
            "risk_tier": risk_tier,
            "confidence_level": confidence_level,
            "position_band": position_band,
        }


class InterpretationService:
    def benchmark_summary(self, *, average_liquidity: float, dispersion: float, reliability_score: float) -> str:
        reliability_text = "high" if reliability_score >= 85 else "moderate"
        dispersion_text = "elevated" if dispersion >= 10 else "contained"
        return (
            f"The active benchmark cohort shows {reliability_text} reliability with average "
            f"liquidity at {average_liquidity:.1f} and {dispersion_text} dispersion."
        )

    def institution_summary(self, *, delta_vs_benchmark: float, risk_tier: str, collateral_structure: str) -> str:
        direction = "below" if delta_vs_benchmark < 0 else "above"
        return (
            f"The institution sits {abs(delta_vs_benchmark):.1f} points {direction} the active "
            f"benchmark with a {risk_tier} risk tier. Key driver: {collateral_structure}."
        )
