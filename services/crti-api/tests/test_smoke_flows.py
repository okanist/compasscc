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
    submitted = client.post("/api/desk/contribute/1/submit", json=submit_payload())
    assert submitted.status_code == 200
    submission_id = submitted.json()["resource_id"]

    assert client.get("/api/desk/processing/1").status_code == 200
    assert client.get("/api/desk/benchmark").status_code == 200
    assert client.get("/api/desk/my-position").status_code == 200

    assert client.get("/api/operator/overview").status_code == 200
    pending = client.get("/api/operator/submissions/pending")
    assert pending.status_code == 200
    assert any(item["id"] == submission_id for item in pending.json())

    reviewed = client.post(f"/api/operator/submissions/{submission_id}/review", json={"review_status": "approved", "policy_status": "matched"})
    assert reviewed.status_code == 200
    assert reviewed.json()["next_state"] == "approved"

    triggered = client.post("/api/operator/processing/1/trigger")
    assert triggered.status_code == 200
    run_id = triggered.json()["resource_id"]
    snapshot_id = triggered.json()["related_resource_id"]

    assert client.get(f"/api/operator/processing/{run_id}").status_code == 200
    approved = client.post(f"/api/operator/releases/{run_id}/approve")
    assert approved.status_code == 200
    assert approved.json()["next_state"] == "approved"
    assert client.get("/api/operator/institution-output/1").status_code == 200

    operator_output = client.get("/api/operator/institution-output/1").json()
    output_id = operator_output["output"]["id"]
    recorded = client.post(f"/api/desk/my-position/{output_id}/record")
    assert recorded.status_code == 200
    record_id = recorded.json()["resource_id"]

    assert client.get("/api/auditor/overview").status_code == 200
    assert client.get(f"/api/auditor/processing/{run_id}/evidence").status_code == 200
    assert client.get(f"/api/auditor/benchmark/{snapshot_id}/audit").status_code == 200
    auditor_output = client.get(f"/api/auditor/institution-output/{output_id}")
    assert auditor_output.status_code == 200
    assert auditor_output.json()["recommended_actions"] == []
    assert client.get(f"/api/auditor/audit-records/{record_id}").status_code == 200


def test_duplicate_record_to_canton_is_idempotent() -> None:
    reset_demo_state()

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
