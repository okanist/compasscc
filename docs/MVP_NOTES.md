# MVP Notes

## What Is Simulated

Compass is currently a seed-backed, simulation-driven MVP. It demonstrates the end-to-end product lifecycle without claiming production infrastructure for every boundary.

The MVP simulates:

- Prepared institution contribution packages.
- Confidential compute / TEE processing state.
- Benchmark release readiness.
- Canton-style record finalization.
- Role-specific projections for Institution Desk, Operator, and Auditor.

The MVP does not yet include:

- Live bank-side connector.
- Production confidential compute or TEE runtime.
- Live Daml command submission.
- Live Canton event ingestion.
- External real data integrations.
- Fully exportable evidence packages.

## Seed-Backed State

The backend starts from prepared demo state. Alpha Bank has a privacy-safe contribution package that can be submitted into the lifecycle. The reset endpoint returns the system to a repeatable demo state:

```bash
curl -X POST http://localhost:8000/api/dev/reset-demo-state
```

After reset:

- Alpha Bank's contribution package is prepared but not yet submitted.
- Benchmark release is not ready.
- Audit record finalization is not shown.
- Operator and Auditor views reflect the pre-release lifecycle.

## Simulated Confidential Processing

The confidential processing boundary is represented by backend lifecycle state and projections:

```text
Prepared contribution package
  -> Simulated TEE / confidential boundary
  -> Policy checks + deterministic benchmark computation
  -> Derived benchmark intelligence
  -> Institution-scoped output
  -> Canton-style audit reference
```

In a production deployment, raw eligible fields would be processed inside a confidential compute boundary. The MVP keeps that boundary explicit in the product flow while using deterministic backend logic and seed-backed state for repeatable demos.

## Canton-Style Recording

The MVP represents Canton recording with references such as `CANTON-REC-0001` and `CANTON-REC-0002`.

In the current implementation, "Record to Canton" finalizes a Canton-style audit reference. It does not submit a live Daml command. The `canton/` package and backend adapter seams are present for future command submission, event ingestion, projection synchronization, and record finalization handshakes.

## Raw Data Safety

Final Auditor projections are sanitized:

- No raw Alpha Bank contribution values.
- No raw peer positions.
- No named peer breakdowns.
- No payload dumps.
- Auditor screens expose audit metadata, release scope, references, lifecycle state, and derived output summaries only.
- Release scope is derived outputs only.
- Run-level evidence is labeled separately and limited to processing metadata.

Operators do not receive raw peer breakdowns. Institution Desk sees only its own prepared contribution package and its own institution-scoped derived output.

## Future Integration Seams

The main production seams are:

- Bank-side connector for selected benchmark fields.
- Production confidential compute / TEE integration.
- Backend-to-Daml command submission.
- Canton event ingestion.
- Projection synchronization.
- PostgreSQL-backed repository implementation.
- Exportable audit and evidence packages.
