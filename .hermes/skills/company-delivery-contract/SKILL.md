---
name: company-delivery-contract
description: Govern a Hermes SaaS release from CEO brief through local homologation, including Kanban continuity, handoffs, blockers, SPIKE experiments, and terminal release states. Use for planning, coordinating, reviewing, or reporting any Truco Online release work.
---

# Company delivery contract

Read `AGENTS.md` and `docs/governance/release-lifecycle.md` before mutating the board or declaring progress.

## Invariants

- Keep one active release and one controller card named `RELEASE-vX.Y`.
- Treat release state as controller metadata; do not invent Kanban columns.
- Never infer release completion from the end of a chat turn, an idle queue, a failed worker, or a count of handoffs.
- Only `HOMOLOGADA` is successful. Only the CEO may set `CANCELADA_PELO_CEO`.
- Ask the CEO after brief approval only for business scope, intentional test-contract exceptions, indispensable credentials, or decisions that cannot be tested locally.
- Persist decisions in the repository or Kanban before relying on them.

## Make every handoff productive

Provide the next profile with the card ID, decision or deliverable required, acceptance criterion, dependencies, and relevant artifact paths. Avoid acknowledgement-only messages. Mention one next bot unless work is deliberately parallel.

When an impasse repeats without new evidence, create a `SPIKE` card. State hypotheses, a local experiment, expected evidence, and a decision rule. Resume delivery from the result; do not close the release.

After two failed task attempts, diagnose and either correct prerequisites, split the card, or reassign it. External human blockers use `BLOQUEADA_AGUARDANDO_CEO` and resume from the preserved graph.

## Homologation evidence

Before setting `HOMOLOGADA`, verify the exact release commit, CI, deployed health checks, regression/E2E/security results, URL/API endpoints, mobile artifacts, and known limitations. Record the evidence in the controller card and release report.

