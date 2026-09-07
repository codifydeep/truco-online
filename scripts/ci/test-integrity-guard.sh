#!/usr/bin/env bash
set -euo pipefail

base_ref="${1:-}"
head_ref="${2:-HEAD}"

if [[ -z "${base_ref}" ]]; then
  echo "uso: $0 <base-ref> [head-ref]" >&2
  exit 2
fi

git rev-parse --verify "${base_ref}^{commit}" >/dev/null
git rev-parse --verify "${head_ref}^{commit}" >/dev/null

failed=0

is_test_path() {
  local path="$1"
  [[ "${path}" =~ (^|/)(__tests__|tests?|specs?)(/|$) ]] ||
    [[ "${path}" =~ (\.test|\.spec)\.(js|jsx|ts|tsx|mjs|cjs)$ ]] ||
    [[ "${path}" =~ (^|/)test_[^/]+\.py$ ]] ||
    [[ "${path}" =~ _test\.(go|rs)$ ]]
}

while IFS=$'\t' read -r status old_path new_path; do
  [[ -z "${status}" ]] && continue

  if [[ "${status}" == D* ]] && is_test_path "${old_path}"; then
    echo "ERRO: teste preexistente excluído: ${old_path}" >&2
    failed=1
  fi

  if [[ "${status}" == R* ]] && { is_test_path "${old_path}" || is_test_path "${new_path:-}"; }; then
    echo "ERRO: teste preexistente renomeado: ${old_path} -> ${new_path}" >&2
    failed=1
  fi

  case "${old_path}" in
    scripts/ci/test-integrity-guard.sh|.github/workflows/quality-gates.yml)
      echo "ERRO: proteção de governança alterada no mesmo PR de produto: ${old_path}" >&2
      failed=1
      ;;
  esac
done < <(git diff --name-status -M "${base_ref}" "${head_ref}")

current_file=""
skip_pattern='(^|[^[:alnum:]_])(skip|xit|xdescribe|pytest\.skip|pytest\.mark\.skip|test\.skip|describe\.skip|it\.skip)([[:space:](.]|$)'
assertion_pattern='(assert|expect\(|should\.|assertThat\(|require\.)'
scope_reduction_pattern='(exclude|ignore|testPathIgnorePatterns|collect_ignore|omit)'
while IFS= read -r line; do
  if [[ "${line}" == "+++ b/"* ]]; then
    current_file="${line#+++ b/}"
    continue
  fi

  [[ "${line}" == "+++ "* || "${line}" == "--- "* ]] && continue

  if [[ "${line}" == +* ]] && [[ "${line}" =~ ${skip_pattern} ]]; then
    echo "ERRO: novo marcador de teste ignorado em ${current_file}: ${line}" >&2
    failed=1
  fi

  if is_test_path "${current_file}" && [[ "${line}" == -* ]] && [[ "${line}" =~ ${assertion_pattern} ]]; then
    echo "ERRO: assertion removida de ${current_file}: ${line}" >&2
    failed=1
  fi

  if [[ "${line}" == +* ]] && [[ "${current_file}" =~ (jest|vitest|pytest|playwright|cypress|coverage|package\.json|pyproject\.toml) ]] && [[ "${line}" =~ ${scope_reduction_pattern} ]]; then
    echo "ERRO: possível redução de escopo de testes em ${current_file}: ${line}" >&2
    failed=1
  fi
done < <(git diff --unified=0 "${base_ref}" "${head_ref}" --)

if [[ "${failed}" -ne 0 ]]; then
  echo "Quality gate recusou a mudança. Siga docs/governance/tdd-policy.md." >&2
  exit 1
fi

echo "Integridade estrutural dos testes preservada."
