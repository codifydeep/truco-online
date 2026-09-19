#!/usr/bin/env bash
set -euo pipefail
base_ref="${1:?base commit required}"
head_ref="${2:-HEAD}"
base_ref="$(git rev-parse --verify "${base_ref}^{commit}")"
head_ref="$(git rev-parse --verify "${head_ref}^{commit}")"
guard_tmp="$(mktemp -d)"
trap 'rm -r -- "${guard_tmp}"' EXIT
: > "${guard_tmp}/approved"
if [[ -n "$(git diff --name-only "${base_ref}" "${head_ref}" -- .hermes/reviewed-test-maintenance.json)" ]] && git cat-file -e "${head_ref}:.hermes/reviewed-test-maintenance.json" 2>/dev/null; then
  git show "${base_ref}:scripts/ci/verify-test-maintenance.py" > "${guard_tmp}/verify.py"
  python3 "${guard_tmp}/verify.py" "${base_ref}" "${head_ref}" > "${guard_tmp}/approved"
fi
approved() { grep -Fqx -- "$1" "${guard_tmp}/approved"; }
is_test_path() {
  [[ "$1" =~ (^|/)(__tests__|tests?|specs?)(/|$) ]] || [[ "$1" =~ (\.test|\.spec)\.(js|jsx|ts|tsx|mjs|cjs)$ ]] || [[ "$1" =~ (^|/)test_[^/]+\.py$ ]] || [[ "$1" =~ _test\.(go|rs)$ ]]
}
failed=0
while IFS=$'\t' read -r status old_path new_path; do
  [[ -z "${status}" ]] && continue
  if [[ "${status}" == D* ]] && is_test_path "${old_path}" && ! approved "${old_path}"; then echo "Unreviewed test deletion: ${old_path}" >&2; failed=1; fi
  if [[ "${status}" == R* ]] && { is_test_path "${old_path}" || is_test_path "${new_path:-}"; } && { ! approved "${old_path}" || ! approved "${new_path}"; }; then echo "Unreviewed test rename: ${old_path}" >&2; failed=1; fi
  case "${old_path}" in
    scripts/ci/test-integrity-guard.sh|scripts/ci/verify-test-maintenance.py|scripts/ci/test-maintenance-public.pem|.github/workflows/quality-gates.yml)
      echo "Protected governance changed in product PR: ${old_path}" >&2; failed=1 ;;
  esac
done < <(git diff --name-status -M "${base_ref}" "${head_ref}")
current_file=""
skip_pattern='(^|[^[:alnum:]_])(skip|only|xit|xdescribe|pytest\.skip|pytest\.mark\.skip|test\.skip|describe\.skip|it\.skip)([[:space:](.]|$)'
assertion_pattern='(assert|expect\(|should\.|assertThat\(|require\.)'
scope_reduction_pattern='(exclude|ignore|testPathIgnorePatterns|collect_ignore|omit)'
while IFS= read -r line; do
  if [[ "${line}" == "+++ b/"* ]]; then current_file="${line#+++ b/}"; continue; fi
  [[ "${line}" == "+++ "* || "${line}" == "--- "* ]] && continue
  if is_test_path "${current_file}" && [[ "${line}" == +* && "${line}" =~ ${skip_pattern} ]]; then echo "Ignored/focused test marker: ${current_file}" >&2; failed=1; fi
  if is_test_path "${current_file}" && [[ "${line}" == -* && "${line}" =~ ${assertion_pattern} ]] && ! approved "${current_file}"; then echo "Unreviewed assertion removal: ${current_file}" >&2; failed=1; fi
  if [[ "${line}" == +* && "${current_file}" =~ (jest|vitest|pytest|playwright|cypress|coverage|package\.json|pyproject\.toml) && "${line}" =~ ${scope_reduction_pattern} ]]; then echo "Possible test discovery reduction: ${current_file}" >&2; failed=1; fi
done < <(git diff --unified=0 "${base_ref}" "${head_ref}" --)
[[ "${failed}" -eq 0 ]] || exit 1
echo "Structural integrity preserved; exact signed technical maintenance accepted only when present."
