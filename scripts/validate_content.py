#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
content = root / 'content'
errors = []

required_site = [
    'name','tagline','city','domain','primary_cta_label','primary_cta_url',
    'community_cta_label','community_cta_url','contact_email','hero_title','hero_subtitle'
]

def parse_frontmatter(path: Path):
    text = path.read_text(encoding='utf-8')
    if not text.startswith('---\n'):
        return {}
    parts = text.split('---\n')
    if len(parts) < 3:
        return {}
    front = parts[1]
    data = {}
    for line in front.splitlines():
      if ':' in line:
        k,v = line.split(':',1)
        data[k.strip()] = v.strip()
    return data

site = parse_frontmatter(content/'site.md')
for key in required_site:
    if key not in site or not site[key]:
        errors.append(f'site.md missing {key}')

for event in (content/'events').glob('*.md'):
    fm = parse_frontmatter(event)
    for k in ['title','date','location','luma_url','status']:
        if not fm.get(k):
            errors.append(f'{event.name} missing {k}')
    if fm.get('luma_url','').startswith('https://') is False:
        errors.append(f'{event.name} luma_url must be https://')

if errors:
    print('CONTENT VALIDATION FAILED:')
    for e in errors:
        print('-', e)
    raise SystemExit(1)

print('Content validation passed.')
