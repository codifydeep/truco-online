#!/usr/bin/env bash
set -euo pipefail
# Only tracked commit contents enter the sandbox; never .git, credentials or socket.
image='sha256:a8ede02d279012a7e77bd614dc59607187bf50572e7fa26e84cbc825ba07c1eb'
docker image inspect "$image" >/dev/null
volume="truco-online-ci-node-$(date +%s)-${RANDOM}"
docker volume create --label com.codifydeep.project=truco-online "$volume" >/dev/null
cleanup() { docker volume rm "$volume" >/dev/null; }
trap cleanup EXIT
common=(--rm --label com.docker.compose.project=truco-online --label com.codifydeep.project=truco-online --security-opt=no-new-privileges --memory=1g --cpus=2 --pids-limit=128 --read-only --tmpfs /tmp:rw,exec,size=256m -e NODE_OPTIONS=--dns-result-order=ipv4first -e npm_config_fetch_timeout=30000 -e npm_config_fetch_retries=1 -v "$volume:/work" -w /work --entrypoint sh)
# Dependency fetch/audit is separate from execution of repository test code.
git archive HEAD | docker run -i "${common[@]}" --user 0 --cap-drop=ALL --cap-add=CHOWN -e npm_config_cache=/tmp/npm "$image" -c 'set -eu; tar -xf -; npm ci --ignore-scripts --no-audit; npm audit --audit-level=high; chown -R 10000:10000 /work'
docker run "${common[@]}" --user 10000:10000 --cap-drop=ALL --network=none -e npm_config_cache=/tmp/npm "$image" -c 'npm test && npm run lint && npm run typecheck && npm run build'
