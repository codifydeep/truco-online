#!/usr/bin/env python3
"""Detect stale generated contracts without reading runtime credentials."""
import hashlib
import json
from pathlib import Path

root=Path(__file__).resolve().parents[2]
manifest=json.loads((root/'.hermes/team/generated-manifest.json').read_text())
for name,digest in manifest['files'].items():
    path=root/name
    assert path.resolve().is_relative_to(root.resolve()), 'manifest path escapes repository'
    assert hashlib.sha256(path.read_bytes()).hexdigest()==digest, 'generated drift: '+name
model='deepseek/deepseek-v4-flash-0731'
for profile in 'produto designer cto techlead backend_data frontend mobile devops quality_security'.split():
    config=(root/'.hermes/team/configs'/f'{profile}.yaml').read_text()
    assert '  default: '+model+'\n' in config and '  provider: openrouter\n' in config, profile
    assert '  max_turns: 40\n' in config and 'qwen3.5:9b' not in config, profile
    soul=(root/'.hermes/team/profiles'/profile/'SOUL.md').read_text()
    assert model in soul and 'Somente qwen3.5:9b' not in soul, profile
assert (root/'AGENTS.md').read_bytes()==(root/'docs/governance/company-contract.md').read_bytes()
print('PASS: generated contract hashes, nine DeepSeek templates, 40 turns, canonical contract.')
