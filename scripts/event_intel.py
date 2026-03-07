#!/usr/bin/env python3
from pathlib import Path
import json
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / 'data' / 'event-sources.json'
OUT = ROOT / 'reports' / 'event-intel.md'

src = json.loads(SOURCES.read_text(encoding='utf-8'))
lines = []
lines.append('# Weekly Event Intel')
lines.append('')
lines.append(f'- Generated: {datetime.utcnow().isoformat()}Z')
lines.append('- Purpose: discover local and peer AI meetups to feature on vibeDSM')
lines.append('')
lines.append('## Tracked Sources')
for s in src.get('sources', []):
    lines.append(f"- {s['name']}: {s['url']} ({s.get('type','source')})")
lines.append('')
lines.append('## Curation Queue')
lines.append('- [ ] Add any valid Des Moines AI events to `content/external-events/*.md`')
lines.append('- [ ] Keep only events with valid URL/date/city')
lines.append('- [ ] Remove stale events older than 60 days')
lines.append('')
lines.append('## Notes')
lines.append('- This report is an agent handoff document; feature additions are merged via PR.')

OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote {OUT}')
