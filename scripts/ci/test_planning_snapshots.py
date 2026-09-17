import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('snapshots', Path(__file__).with_name('check-planning-snapshots.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SnapshotTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        # Real immutable brief; tests do not replace the approved digest.
        brief = Path(__file__).with_name('fixtures') / 'approved-brief.md'
        (self.root / 'approved-brief.md').write_bytes(brief.read_bytes())
        self.manifest = dict(attempt='truco-restart-20260911',
            brief_sha256=hashlib.sha256(brief.read_bytes()).hexdigest(), documents=[])
        for index, (name, pair) in enumerate(module.EXPECTED.items()):
            content = ('Fixture ' + name).encode()
            (self.root / name).write_bytes(content)
            self.manifest['documents'].append(dict(path=name, task=f't_{index:08x}',
                author=pair[0], reviewer=pair[1], review_run=index+1, revision='a'*64,
                sha256=hashlib.sha256(content).hexdigest()))
        self.save()

    def save(self):
        (self.root / 'approvals.json').write_text(json.dumps(self.manifest))

    def test_exact_export_passes(self):
        module.validate(self.root)

    def test_altered_document_rejected(self):
        (self.root / 'design.md').write_text('Changed after approval')
        with self.assertRaises(AssertionError): module.validate(self.root)

    def test_wrong_reviewer_rejected(self):
        self.manifest['documents'][0]['reviewer'] = 'produto'
        self.save()
        with self.assertRaises(AssertionError): module.validate(self.root)

    def test_missing_document_rejected(self):
        (self.root / 'plan.md').unlink()
        with self.assertRaises(FileNotFoundError): module.validate(self.root)

    def test_invalid_revision_rejected(self):
        self.manifest['documents'][0]['revision'] = 'z'*64
        self.save()
        with self.assertRaises(AssertionError): module.validate(self.root)

    def test_replaced_brief_rejected(self):
        (self.root / 'approved-brief.md').write_text('Unapproved replacement')
        self.manifest['brief_sha256'] = hashlib.sha256(b'Unapproved replacement').hexdigest()
        self.save()
        with self.assertRaises(AssertionError): module.validate(self.root)

    def test_duplicate_receipt_rejected(self):
        self.manifest['documents'][1]['task'] = self.manifest['documents'][0]['task']
        self.save()
        with self.assertRaises(AssertionError): module.validate(self.root)


if __name__ == '__main__': unittest.main()
