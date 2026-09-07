---
name: local-homologation
description: Build, deploy, validate, and report a Truco Online release in free local Docker infrastructure. Use for CI/CD, observability, release candidates, smoke tests, rollback, Android APK, or Expo Go homologation.
---

# Local homologation

Read `docs/governance/release-lifecycle.md` and the active ADRs before deploying.

## Boundary

Use only local Docker, local storage, open-source dependencies, Android APK builds, and Expo Go over the local network. Do not provision cloud resources, paid services, EAS Build, App Store, Play Store, or production infrastructure.

## Release candidate

Deploy an immutable commit from `release/vX.Y`. Validate Compose configuration before replacing the current environment. Services need health checks, bounded resource use, useful logs, and documented local ports. Do not expose secrets in images, Compose files, logs, or reports.

## Gate

After deployment, run smoke, integration, E2E, regression, and agreed security checks against the deployed environment. Record commands, timestamps, commit, results, URL/API endpoints, APK checksum, Expo Go instructions, limitations, and rollback steps.

Deployment success alone does not mean homologation. `quality_security` must approve deployed behavior, then `techlead` can set the controller to `HOMOLOGADA`.

