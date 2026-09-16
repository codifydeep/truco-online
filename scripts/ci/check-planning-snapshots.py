#!/usr/bin/env python3
"""Check exported snapshot consistency; does NOT grant independent PR approval."""
import hashlib
import json
from pathlib import Path

root=Path(__file__).resolve().parents[2]/'docs/planning/v0.1'
manifest=json.loads((root/'approvals.json').read_text())
expected={'stories.md':('produto','techlead'),'architecture.md':('cto','techlead'),
          'design.md':('designer','produto'),'plan.md':('techlead','cto')}
assert manifest['attempt']=='truco-restart-20260911'
assert hashlib.sha256((root/'approved-brief.md').read_bytes()).hexdigest()==manifest['brief_sha256']
assert len(manifest['documents'])==4
assert {d['path'] for d in manifest['documents']}==set(expected)
for document in manifest['documents']:
    assert (document['author'],document['reviewer'])==expected[document['path']]
    assert isinstance(document['review_run'],int) and document['review_run']>0
    assert len(document['revision'])==64
    assert hashlib.sha256((root/document['path']).read_bytes()).hexdigest()==document['sha256']
print('PASS: four reviewed document hashes and approved brief match export receipts. PR approval remains separate.')
