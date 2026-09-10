#!/usr/bin/env bash
set -euo pipefail

ran=0

scripts/ci/check-docker-naming.sh

if [[ -f package.json ]]; then
  ran=1
  if [[ -f pnpm-lock.yaml ]]; then
    corepack enable
    pnpm install --frozen-lockfile
    runner=(pnpm run)
  elif [[ -f yarn.lock ]]; then
    corepack enable
    yarn install --immutable
    runner=(yarn run)
  elif [[ -f package-lock.json ]]; then
    npm ci
    runner=(npm run)
  else
    echo "ERRO: package.json existe sem lockfile reproduzível." >&2
    exit 1
  fi

  for script in test lint typecheck build; do
    if node -e "const p=require('./package.json'); process.exit(p.scripts?.['${script}'] ? 0 : 1)"; then
      "${runner[@]}" "${script}"
    fi
  done

  if [[ -f package-lock.json ]]; then
    npm audit --audit-level=high
  fi
fi

if [[ -f pyproject.toml || -f pytest.ini || -d tests ]]; then
  if command -v python3 >/dev/null && python3 -m pytest --version >/dev/null 2>&1; then
    ran=1
    python3 -m pytest
  fi
fi

if [[ -f compose.homolog.yml ]]; then
  ran=1
  docker compose -p truco-online-hml -f compose.homolog.yml config --quiet
fi

if [[ "${ran}" -eq 0 ]]; then
  echo "Bootstrap sem stack: nenhum quality gate de aplicação aplicável ainda."
fi
