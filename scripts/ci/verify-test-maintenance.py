#!/usr/bin/env python3
"""Run from the trusted base, never trust a verifier or key from PR head."""
import base64,hashlib,json,re,subprocess,sys,tempfile
from pathlib import Path

def git(*args):return subprocess.run(['git',*args],capture_output=True,check=True).stdout
def verify(base,head):
    if not re.fullmatch(r'[0-9a-f]{40}',base) or not re.fullmatch(r'[0-9a-f]{40}',head):raise ValueError('exact commit IDs required')
    raw=git('show',head+':.hermes/reviewed-test-maintenance.json')
    if len(raw)>1024*1024:raise ValueError('bounded attestation required')
    envelope=json.loads(raw);p=envelope['payload']
    if envelope['algorithm']!='Ed25519' or p['base']!=base or p['version']!=1 or p['scope']!='reviewed_test_maintenance_only' or p['author']==p['reviewer']:raise ValueError('attestation scope or independence')
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp);(root/'key').write_bytes(git('show',base+':scripts/ci/test-maintenance-public.pem'))
        (root/'payload').write_bytes(json.dumps(p,sort_keys=True,separators=(',',':')).encode());(root/'signature').write_bytes(base64.b64decode(envelope['signature'],validate=True))
        subprocess.run(['openssl','pkeyutl','-verify','-pubin','-inkey',str(root/'key'),'-rawin','-in',str(root/'payload'),'-sigfile',str(root/'signature')],capture_output=True,check=True)
    for path,sha in p['source_manifest'].items():
        if hashlib.sha256(git('show',head+':'+path)).hexdigest()!=sha:raise ValueError('source differs from reviewed delivery: '+path)
    for path in p['removed_paths']:
        if git('ls-tree',head,'--',path).strip():raise ValueError('reviewed rename still contains old path')
    for path in p['allowed_test_paths']:
        if '\n' in path or path.startswith('/') or '..' in path.split('/') or not re.search(r'(^|/)(tests?|specs?)/|\.(test|spec)\.',path):raise ValueError('unregistered test path')
    return p['allowed_test_paths']
if __name__=='__main__':
    try:
        for path in verify(*sys.argv[1:]):print(path)
    except Exception as exc:
        print('No valid reviewed-maintenance attestation: '+type(exc).__name__,file=sys.stderr);sys.exit(1)
