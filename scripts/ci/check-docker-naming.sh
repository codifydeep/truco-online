#!/usr/bin/env bash
set -euo pipefail

failed=0

while IFS= read -r file; do
  [[ -n "${file}" ]] || continue

  project_name="$(sed -nE 's/^name:[[:space:]]*([^[:space:]#]+).*/\1/p' "${file}" | head -n 1 | tr -d "\"'")"
  if [[ ! "${project_name}" =~ ^truco-online-(hml|dev|ci-[a-z0-9-]+)$ ]]; then
    echo "ERRO: ${file} deve declarar name: truco-online-hml, truco-online-dev ou truco-online-ci-<id>." >&2
    failed=1
  fi

  while IFS= read -r explicit_name; do
    [[ -n "${explicit_name}" ]] || continue
    if [[ ! "${explicit_name}" =~ ^truco-online-[a-z0-9-]+$ ]]; then
      echo "ERRO: ${file} contém container_name fora do prefixo truco-online-: ${explicit_name}" >&2
      failed=1
    fi
  done < <(sed -nE 's/^[[:space:]]*container_name:[[:space:]]*([^[:space:]#]+).*/\1/p' "${file}" | tr -d "\"'")
done < <(git ls-files | grep -E '(^|/)(compose([.-][^/]*)?\.(yml|yaml)|docker-compose\.(yml|yaml))$' || true)

exit "${failed}"
