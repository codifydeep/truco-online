---
name: company-delivery-contract
description: Govern a Hermes SaaS release from CEO brief through local homologation, including Kanban continuity, handoffs, blockers, SPIKE experiments, and terminal release states. Use for planning, coordinating, reviewing, or reporting any Truco Online release work.
---

# Company delivery contract

Read `AGENTS.md` and `docs/governance/release-lifecycle.md` before mutating the board or declaring progress.
Use `.hermes/templates/release-controller.md` when creating a controller and `.hermes/templates/spike.md` when converting a repeated impasse into an experiment.

## Invariants

- Keep one active release and one controller card named `RELEASE-vX.Y`.
- Treat release state as controller metadata; do not invent Kanban columns.
- Never infer release completion from the end of a chat turn, an idle queue, a failed worker, or a count of handoffs.
- Only `HOMOLOGADA` is successful. Only the CEO may set `CANCELADA_PELO_CEO`.
- Ask the CEO after brief approval only for business scope, intentional test-contract exceptions, indispensable credentials, or decisions that cannot be tested locally.
- Persist decisions in the repository or Kanban before relying on them.

## Make every handoff productive

Provide the next profile with the card ID, decision or deliverable required, acceptance criterion, dependencies, and relevant artifact paths. Avoid acknowledgement-only messages. Mention one next bot unless work is deliberately parallel.

Telegram routing is literal. A role name in prose does not activate a bot. Read `.hermes/team/telegram-roster.yaml` immediately before the handoff and include the exact `@username` of every intended recipient. Never ask the CEO what another profile wants; address that profile directly.

Use only the canonical Kanban assignees `produto`, `designer`, `cto`, `techlead`, `backend_data`, `frontend`, `mobile`, `devops`, and `quality_security`. Validate the assignee with `hermes kanban assignees` before creating or reassigning work. Do not use translated role labels or improvised aliases.

After the CEO approves the Product Brief, `produto` must persist it in the repository, complete the discovery card, and hand off explicitly to `@techlead_truco_poc_bot`. From then on, the Tech Lead owns ordering, dependencies, parallelism, and specialist assignment. Product must not implement UI, backend, infrastructure, tests, or production code and must not ask the CEO to select an implementer.

Do not link executable cards with `RELEASE-vX.Y` as their dependency parent. Hermes releases a child only after its parent is done, but the controller must stay open until homologation. Track release membership in controller comments/metadata and use links only for dependencies that are expected to complete.

Never report a file, command, commit, PR, test, deployment, or URL from imagination. Verify artifacts in the assigned worktree, run the required checks, commit them, and record the exact SHA and PR URL. If evidence cannot be produced, block the card with the concrete failure. Reviewers must inspect real repository evidence rather than accepting a Kanban comment as proof.

Run repository checks against content Git can actually see. For new files, stage them before using `git diff --cached --check`; after committing, run `git show --check --oneline HEAD` and confirm `git status --porcelain` is empty. A plain `git diff --check` does not inspect untracked files and is not sufficient evidence.

Run GitHub commands from the assigned Git worktree. Open a release PR with the explicit shape `gh pr create --base release/vX.Y --head <current-branch> --title <title> --body <body>` and then verify it with `gh pr view --json number,url,state,baseRefName,headRefName`. Do not use `--web` for non-interactive verification, do not pass a stray positional `HEAD`, do not use the feature branch as `--base`, and do not pass Telegram bot usernames to `--reviewer`: the PoC uses one GitHub account, so logical reviewer independence is recorded by the Hermes profile in the Kanban and in a PR comment. If a PR already exists for the head branch, inspect and reuse it instead of creating a duplicate.

When an impasse repeats without new evidence, create a `SPIKE` card. State hypotheses, a local experiment, expected evidence, and a decision rule. Resume delivery from the result; do not close the release.

After two failed task attempts, diagnose and either correct prerequisites, split the card, or reassign it. External human blockers use `BLOQUEADA_AGUARDANDO_CEO` and resume from the preserved graph.

## Homologation evidence

Before setting `HOMOLOGADA`, verify the exact release commit, CI, deployed health checks, regression/E2E/security results, URL/API endpoints, mobile artifacts, and known limitations. Record the evidence in the controller card and release report.
