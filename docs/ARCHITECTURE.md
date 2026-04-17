# Architecture

## Overview

Compass is designed as a privacy-preserving institutional intelligence workflow on Canton. The product does not expose raw proprietary positions. Instead, it collects selected contribution fields under policy, processes them confidentially, computes deterministic analytics, and publishes auditable outputs.

## Intended Flow

1. Private contribution
Institutions contribute selected repo and treasury fields into a controlled campaign. Contribution quality can differ based on attestation method, contributor reputation, and policy compliance.

2. Confidential processing / TEE concept
Submitted data is processed inside a confidential boundary. The architectural assumption is a trusted execution environment or comparable confidential compute layer where raw input is not exposed outside the secure runtime.

3. Deterministic scoring
The core intelligence layer computes benchmark metrics, reliability measures, dispersion signals, and institution-scoped comparison outputs with deterministic analytics. This is the primary logic of the product.

4. Local explanation
A local explanation layer can restate already-computed outputs for operations or audit handoff. It does not invent the benchmark and it is not the system of record.

5. Benchmark generation
Compass produces trust-weighted benchmark intelligence such as average repo rate, average haircut, liquidity dispersion, and benchmark reliability using quality-aware aggregation rules.

6. Institution-specific results
Each institution receives an institution-scoped comparison against the benchmark, including deltas, risk tier, confidence level, and an explainable summary of the deterministic result.

7. Auditable outputs on Canton
Benchmark publication, contribution metadata, intelligence requests, and institution-specific result records can be represented on Canton to support workflow control, selective visibility, and audit-friendly lineage.

## Design Principles

- repo-native, treasury-aware
- privacy-preserving
- deterministic analytics first
- local explanation second
- audit-friendly
- role-based visibility
- institutional, not retail

