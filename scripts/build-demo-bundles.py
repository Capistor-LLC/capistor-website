"""Build explicitly labelled, non-production download fixtures without paid tools."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json

root = Path(__file__).resolve().parents[1]
out = root / '.local' / 'demo-bundles'
out.mkdir(parents=True, exist_ok=True)
products = [
 ('basketball-shot-timer-pcb-pack', 'Basketball shot timer', 'basketball-shot-timer-pcb.webp'),
 ('steering-bellcrank-3d-print-kit', 'Steering bellcrank', 'steering-bellcrank-concept.webp'),
 ('restaurant-call-pager-design-pack', 'Restaurant call pager', 'restaurant-pager-pcb.webp'),
]
for slug, title, image in products:
    files = {
      'START-HERE.txt': f'CAPISTOR — {title}\nSANDBOX SAMPLE v0.1\n\nThis bundle proves checkout and private file delivery. No real payment is required.\nIt is not the commercial engineering release. Do not manufacture or rely on these sample files.\n\nOpen preview.webp to view the storefront concept. Read setup-guide.md and example-bom.csv.\nThe final release must replace these fixtures before public sales.\n',
      'setup-guide.md': f'# {title}: sample setup guide\n\n1. Extract this archive.\n2. Open preview.webp.\n3. Inspect the example parts list.\n4. Return to your Capistor order to ask a question or download again.\n\nThis is a delivery demonstration; fabrication, electrical tests and assembly instructions are not validated.\n',
      'example-bom.csv': 'Reference,Description,Quantity,Status\nDEMO-1,Example part for delivery test,1,Not approved for manufacturing\n',
      'release-notes.txt': 'v0.1: Sandbox delivery fixture. No fabrication-ready Gerbers, STEP or PCB source included.\n',
    }
    if 'steering' in slug:
        files['concept.scad'] = '// Original demonstration geometry only; dimensions in mm. Not validated for use.\n$fn=64;\ndifference(){ hull(){cylinder(h=4,r=8);translate([28,0,0])cylinder(h=4,r=6);translate([0,28,0])cylinder(h=4,r=6);} for(p=[[0,0],[28,0],[0,28]])translate([p[0],p[1],-1])cylinder(h=6,r=2);}\n'
    with ZipFile(out / f'{slug}-SAMPLE.zip', 'w', ZIP_DEFLATED) as archive:
        for name, text in files.items():
            archive.writestr(name, text)
        archive.write(root / 'public' / 'products' / image, 'preview.webp')
    data=(out / f'{slug}-SAMPLE.zip').read_bytes()
    print(json.dumps({'bundle':slug, 'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest()}))
