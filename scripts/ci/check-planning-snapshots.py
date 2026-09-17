#!/usr/bin/env python3
"""Validate exported bytes and receipt schema; not independent approval authority."""
import hashlib
import json
from pathlib import Path
import re

EXPECTED = {'stories.md': ('produto', 'techlead'), 'architecture.md': ('cto', 'techlead'),
            'design.md': ('designer', 'produto'), 'plan.md': ('techlead', 'cto')}


def validate(root):
    manifest = json.loads((root / 'approvals.json').read_text())
    assert manifest['attempt'] == 'truco-restart-20260911', 'wrong attempt'
    assert manifest['brief_sha256'] == '273d7760dc25b2641631a98a8d3aef352883d4a92469c145154285e9dd17d403', 'wrong approved brief'
    assert hashlib.sha256((root / 'approved-brief.md').read_bytes()).hexdigest() == manifest['brief_sha256'], 'brief changed'
    documents = manifest['documents']
    assert len(documents) == 4 and {d['path'] for d in documents} == set(EXPECTED), 'wrong document set'
    assert len({d['task'] for d in documents}) == 4, 'duplicate task receipt'
    for document in documents:
        assert (document['author'], document['reviewer']) == EXPECTED[document['path']], 'wrong reviewer'
        assert re.fullmatch(r't_[0-9a-f]{8}', document['task']), 'invalid task identity'
        assert type(document['review_run']) is int and document['review_run'] > 0, 'invalid review run'
        assert re.fullmatch(r'[0-9a-f]{64}', document['revision']), 'invalid revision'
        assert re.fullmatch(r'[0-9a-f]{64}', document['sha256']), 'invalid digest'
        assert hashlib.sha256((root / document['path']).read_bytes()).hexdigest() == document['sha256'], 'document changed'


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[2] / 'docs/planning/v0.1'
    if root.exists():
        validate(root)
        print('PASS: exact document hashes, approved brief and receipt schema. Private controller provenance and PR approval remain separate gates.')
    else:
        print('Foundation only: no planning export present; snapshot validation not applicable yet.')
