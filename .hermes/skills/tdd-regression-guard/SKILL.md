---
name: tdd-regression-guard
description: Enforce Red-Green-Refactor and protect existing automated tests during implementation and PR review. Use whenever code, tests, CI configuration, or test contracts change.
---

# TDD regression guard

Read `docs/governance/tdd-policy.md` before changing code or reviewing a PR.

## Implementation contract

Record a failing test for the intended behavior before production code. Confirm that it fails for the expected reason, implement the smallest change, then run the targeted test and full existing suite. Put commands and results in the PR.

Do not delete, rename, skip, weaken, narrow discovery of, or remove assertions from preexisting tests to make work pass. A failing old test is regression evidence until an explicit contract-change card approved by the CEO proves otherwise.

## Review contract

Compare the PR against its release base, not only the final files. Inspect deleted and renamed files, removed assertions, new skip markers, test-runner configuration, coverage/exclusion changes, and CI workflow changes. Run `scripts/ci/test-integrity-guard.sh <base> <head>` from the trusted base version and run the complete suite.

Reject the PR with actionable findings when evidence is missing or a protection is weakened. Never self-approve. A dedicated contract-change PR must be integrated into the base before dependent implementation; agents cannot bypass the guard from the feature branch.

