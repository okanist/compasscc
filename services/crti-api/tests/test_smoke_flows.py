from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def reset_demo_state() -> None:
    response = client.post("/api/dev/reset-demo-state")
    assert response.status_code == 200


def submit_payload() -> dict:
    return {
        "submission_type": "System-signed",
        "confidence_tier": "High",
        "attestation_status": "system_signed",
        "payload": {
            "liquidity_score": 70.2,
            "repo_rate": 4.9,
            "haircut": 3.0,
            "notional": 150_000_000,
            "collateral_structure": "UST-heavy with concentrated tenor",
            "maturity_bucket": "8-14 days",
        },
    }


def test_desk_operator_auditor_demo_smoke_flow() -> None:
    reset_demo_state()

    assert client.get("/api/desk/overview").status_code == 200
    assert client.get("/api/desk/contribute/1").status_code == 200
    processing_before_submit = client.get("/api/desk/processing/1")
    assert processing_before_submit.status_code == 200
    assert processing_before_submit.json()["processing_context"]["benchmark_ready"] is False
    assert processing_before_submit.json()["processing_context"]["next_action"] == "submit_contribution"
    benchmark_before_submit = client.get("/api/desk/benchmark")
    assert benchmark_before_submit.status_code == 200
    benchmark_before_payload = benchmark_before_submit.json()
    assert benchmark_before_payload["benchmark_context"]["benchmark_ready"] is False
    assert benchmark_before_payload["benchmark_context"]["benchmark_readiness"] == "Not ready"
    assert benchmark_before_payload["benchmark_context"]["next_action"] == "submit_contribution"
    assert benchmark_before_payload["snapshot"] is None
    assert benchmark_before_payload["primary_metrics"] == []
    assert benchmark_before_payload["secondary_metrics"] == []
    assert benchmark_before_payload["distribution"] is None
    assert benchmark_before_payload["alerts"] == []
    position_before_submit = client.get("/api/desk/my-position")
    assert position_before_submit.status_code == 200
    position_before_payload = position_before_submit.json()
    assert position_before_payload["output_context"]["output_ready"] is False
    assert position_before_payload["output"] is None
    assert position_before_payload["metrics"] == []
    auditor_before_release = client.get("/api/auditor/overview")
    assert auditor_before_release.status_code == 200
    auditor_before_payload = auditor_before_release.json()
    assert auditor_before_payload["overview_sections"]["auditor"]["release_ready"] is False
    assert auditor_before_payload["overview_sections"]["auditor"]["package_available"] is False
    assert next(item for item in auditor_before_payload["metrics"] if item["label"] == "Benchmark Reliability")["value"] == "Awaiting release"
    assert next(item for item in auditor_before_payload["metrics"] if item["label"] == "Attestation Coverage")["value"] == "Awaiting release"
    policy_before_release = client.get("/api/auditor/campaigns/1/policy")
    assert policy_before_release.status_code == 200
    policy_before_payload = policy_before_release.json()["contribution_policy"]
    assert policy_before_payload["policy_status"] == "Active"
    assert policy_before_payload["evidence_context"]["released_cycle"] is False
    assert policy_before_payload["evidence_context"]["accepted_classes_count"] == 3
    assert "review-only" in policy_before_payload["out_of_policy_rule"]
    audit_record_before_release = client.get("/api/auditor/audit-records/1")
    assert audit_record_before_release.status_code == 200
    audit_record_before_context = audit_record_before_release.json()["audit_context"]
    assert audit_record_before_context["finalized"] is False
    assert audit_record_before_context["lifecycle_message"] == "Audit record not finalized yet."
    assert audit_record_before_release.json()["audit_trail"] == ["Audit record not finalized yet"]

    submitted = client.post("/api/desk/contribute/1/submit", json=submit_payload())
    assert submitted.status_code == 200
    submission_id = submitted.json()["resource_id"]

    processing_after_submit = client.get("/api/desk/processing/1")
    assert processing_after_submit.status_code == 200
    assert processing_after_submit.json()["processing_context"]["benchmark_ready"] is True
    assert processing_after_submit.json()["processing_context"]["next_action"] == "view_benchmark"
    benchmark_after_submit = client.get("/api/desk/benchmark")
    assert benchmark_after_submit.status_code == 200
    benchmark_after_payload = benchmark_after_submit.json()
    assert benchmark_after_payload["benchmark_context"]["benchmark_ready"] is True
    assert benchmark_after_payload["benchmark_context"]["benchmark_readiness"] == "Ready"
    assert benchmark_after_payload["benchmark_context"]["next_action"] == "view_benchmark"
    assert benchmark_after_payload["snapshot"]["scenario"] == "Repo with Treasury Collateral"
    assert len(benchmark_after_payload["primary_metrics"]) > 0
    assert benchmark_after_payload["distribution"] is not None
    assert benchmark_after_payload["alerts"]
    position_after_submit = client.get("/api/desk/my-position")
    assert position_after_submit.status_code == 200
    position_after_payload = position_after_submit.json()
    assert position_after_payload["output_context"]["output_ready"] is True
    assert position_after_payload["output_context"]["recordable"] is True
    assert position_after_payload["output"]["id"] == 1
    assert len(position_after_payload["metrics"]) > 0

    assert client.get("/api/operator/overview").status_code == 200
    pending = client.get("/api/operator/submissions/pending")
    assert pending.status_code == 200
    assert len(pending.json()) == 2
    assert any(item["id"] == submission_id for item in pending.json())
    blocked_trigger = client.post("/api/operator/processing/1/trigger")
    assert blocked_trigger.status_code == 409
    assert blocked_trigger.json()["error"]["current_state"] == "pending_review"

    reviewed = client.post(f"/api/operator/submissions/{submission_id}/review", json={"review_status": "approved", "policy_status": "matched"})
    assert reviewed.status_code == 200
    assert reviewed.json()["next_state"] == "approved"
    northline = next(item for item in pending.json() if item["institution"] == "Northline Desk")
    needs_attestation = client.post(f"/api/operator/submissions/{northline['id']}/review", json={"review_status": "needs_attestation", "policy_status": "needs_attestation"})
    assert needs_attestation.status_code == 200
    assert needs_attestation.json()["next_state"] == "needs_attestation"
    assert client.get("/api/operator/submissions/pending").json() == []

    triggered = client.post("/api/operator/processing/1/trigger")
    assert triggered.status_code == 200
    run_id = triggered.json()["resource_id"]
    snapshot_id = triggered.json()["related_resource_id"]

    assert client.get(f"/api/operator/processing/{run_id}").status_code == 200
    approved = client.post(f"/api/operator/releases/{run_id}/approve")
    assert approved.status_code == 200
    assert approved.json()["next_state"] == "approved"
    duplicate_approved = client.post(f"/api/operator/releases/{run_id}/approve")
    assert duplicate_approved.status_code == 200
    assert duplicate_approved.json()["next_state"] == "approved"
    assert client.get("/api/operator/institution-output/1").status_code == 200
    audit_record_after_release = client.get("/api/auditor/audit-records/1")
    assert audit_record_after_release.status_code == 200
    audit_record_after_release_payload = audit_record_after_release.json()
    assert audit_record_after_release_payload["audit_context"]["release_ready"] is True
    assert audit_record_after_release_payload["audit_context"]["finalized"] is False
    assert audit_record_after_release_payload["audit_context"]["lifecycle_message"] == "Institution output is released, but no finalized audit record exists yet."
    assert "Canton-style record finalized" not in audit_record_after_release_payload["audit_trail"]

    operator_output = client.get("/api/operator/institution-output/1").json()
    output_id = operator_output["output"]["id"]
    recorded = client.post(f"/api/desk/my-position/{output_id}/record")
    assert recorded.status_code == 200
    record_id = recorded.json()["resource_id"]
    recorded_position = client.get("/api/desk/my-position")
    assert recorded_position.status_code == 200
    assert recorded_position.json()["output_context"]["record_lifecycle"] == "finalized"
    assert recorded_position.json()["output_context"]["canton_record_ref"].startswith("CANTON-REC-")

    auditor_after_record = client.get("/api/auditor/overview")
    assert auditor_after_record.status_code == 200
    auditor_after_payload = auditor_after_record.json()
    released_snapshot = client.get(f"/api/auditor/benchmark/{snapshot_id}/audit").json()["snapshot"]
    expected_reliability = f"{released_snapshot['reliability_score']:.1f}%"
    expected_coverage = f"{released_snapshot['attested_coverage'] * 100:.0f}%"
    assert auditor_after_payload["overview_sections"]["auditor"]["release_ready"] is True
    assert auditor_after_payload["overview_sections"]["auditor"]["package_available"] is True
    assert next(item for item in auditor_after_payload["metrics"] if item["label"] == "Benchmark Reliability")["value"] == expected_reliability
    assert next(item for item in auditor_after_payload["metrics"] if item["label"] == "Attestation Coverage")["value"] == expected_coverage
    assert next(item for item in auditor_after_payload["metrics"] if item["label"] == "Record Lifecycle")["value"] == "Finalized"
    assert auditor_after_payload["overview_sections"]["auditor"]["record_reference"].startswith("CANTON-REC-")
    policy_after_release = client.get("/api/auditor/campaigns/1/policy").json()["contribution_policy"]
    assert policy_after_release["evidence_context"]["released_cycle"] is True
    assert policy_after_release["policy_enforcement_state"] == "Enforced / Passing"
    assert policy_after_release["evidence_context"]["record_reference"].startswith("CANTON-REC-")
    assert client.get(f"/api/auditor/processing/{run_id}/evidence").status_code == 200
    assert client.get(f"/api/auditor/benchmark/{snapshot_id}/audit").status_code == 200
    auditor_output = client.get(f"/api/auditor/institution-output/{output_id}")
    assert auditor_output.status_code == 200
    assert auditor_output.json()["recommended_actions"] == []
    auditor_record = client.get(f"/api/auditor/audit-records/{record_id}")
    assert auditor_record.status_code == 200
    auditor_record_payload = auditor_record.json()
    assert auditor_record_payload["audit_context"]["finalized"] is True
    assert auditor_record_payload["audit_context"]["canton_record_ref"].startswith("CANTON-REC-")
    assert "Canton-style record finalized" in auditor_record_payload["audit_trail"]


def test_duplicate_record_to_canton_is_idempotent() -> None:
    reset_demo_state()
    submitted = client.post("/api/desk/contribute/1/submit", json=submit_payload())
    assert submitted.status_code == 200

    first = client.post("/api/desk/my-position/1/record")
    second = client.post("/api/desk/my-position/1/record")

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["resource_id"] == second.json()["resource_id"]
    assert second.json()["next_state"] == "finalized"


def test_terminal_submission_review_guards() -> None:
    reset_demo_state()

    duplicate_approve = client.post("/api/operator/submissions/2/review", json={"review_status": "approved", "policy_status": "matched"})
    invalid_change = client.post("/api/operator/submissions/2/review", json={"review_status": "rejected", "policy_status": "rejected"})

    assert duplicate_approve.status_code == 200
    assert duplicate_approve.json()["next_state"] == "approved"
    assert invalid_change.status_code == 409
    assert invalid_change.json()["error"]["code"] == "invalid_state_transition"
