#!/usr/bin/env bash
set -euo pipefail

guard="$(cd "$(dirname "$0")" && pwd)/test-integrity-guard.sh"
fixture="$(mktemp -d)"
trap 'rm -rf "${fixture}"' EXIT

git -C "${fixture}" init -q
git -C "${fixture}" config user.name "Integrity Guard Test"
git -C "${fixture}" config user.email "integrity-guard@example.invalid"
mkdir -p "${fixture}/tests" "${fixture}/src"

printf '%s\n' 'def test_value():' '    assert 1 == 1' > "${fixture}/tests/test_value.py"
printf '%s\n' 'value = 1' > "${fixture}/src/value.py"
git -C "${fixture}" add .
git -C "${fixture}" commit -qm base
base="$(git -C "${fixture}" rev-parse HEAD)"

printf '%s\n' 'value = 2' > "${fixture}/src/value.py"
git -C "${fixture}" add .
git -C "${fixture}" commit -qm safe-change
safe="$(git -C "${fixture}" rev-parse HEAD)"
git -C "${fixture}" reset -q --hard "${base}"

if ! (cd "${fixture}" && "${guard}" "${base}" "${safe}") >/dev/null; then
  echo "guard rejeitou uma alteração segura" >&2
  exit 1
fi

git -C "${fixture}" rm -q tests/test_value.py
git -C "${fixture}" commit -qm delete-test
deleted="$(git -C "${fixture}" rev-parse HEAD)"
git -C "${fixture}" reset -q --hard "${base}"

if (cd "${fixture}" && "${guard}" "${base}" "${deleted}") >/dev/null 2>&1; then
  echo "guard aceitou exclusão de teste" >&2
  exit 1
fi

printf '%s\n' 'import pytest' '' '@pytest.mark.skip' 'def test_value():' '    assert 1 == 1' > "${fixture}/tests/test_value.py"
git -C "${fixture}" add .
git -C "${fixture}" commit -qm add-skip
skipped="$(git -C "${fixture}" rev-parse HEAD)"
git -C "${fixture}" reset -q --hard "${base}"

if (cd "${fixture}" && "${guard}" "${base}" "${skipped}") >/dev/null 2>&1; then
  echo "guard aceitou skip novo" >&2
  exit 1
fi

printf '%s\n' 'def test_value():' '    value = 1' > "${fixture}/tests/test_value.py"
git -C "${fixture}" add .
git -C "${fixture}" commit -qm remove-assertion
weakened="$(git -C "${fixture}" rev-parse HEAD)"

if (cd "${fixture}" && "${guard}" "${base}" "${weakened}") >/dev/null 2>&1; then
  echo "guard aceitou remoção de assertion" >&2
  exit 1
fi

echo "Testes do guard aprovados."

