#!/usr/bin/env python3
import json
import re
import html as html_mod
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
LOG_DIR = ROOT / 'logs'
LOG_DIR.mkdir(exist_ok=True)

ALLOWED_TARGETS = {'home', 'events', 'community', 'partners'}
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')


def strip_html(text: str) -> str:
    """Remove HTML tags and decode entities from untrusted input."""
    return html_mod.unescape(re.sub(r'<[^>]+>', '', text))


def safe_content_path(filename: str) -> Path:
    """Resolve a path under content/ and verify it stays within bounds."""
    target = (ROOT / 'content' / filename).resolve()
    if not str(target).startswith(str((ROOT / 'content').resolve())):
        raise ValueError(f'Path traversal blocked: {filename}')
    return target


def parse_frontmatter(text: str):
    if not text.startswith('---\n'):
        return {}, text
    parts = text.split('---\n', 2)
    if len(parts) < 3:
        return {}, text
    fm_raw, body = parts[1], parts[2]
    fm = {}
    for ln in fm_raw.splitlines():
        if ':' in ln:
            k, v = ln.split(':', 1)
            fm[k.strip()] = v.strip()
    return fm, body


def dump_frontmatter(fm: dict, body: str):
    lines = ['---']
    for k, v in fm.items():
        lines.append(f"{k}: {v}")
    lines.append('---')
    lines.append('')
    lines.append(body.strip() + '\n')
    return '\n'.join(lines)


def append_log(entry: dict):
    with (LOG_DIR / 'intent-actions.jsonl').open('a', encoding='utf-8') as f:
        f.write(json.dumps(entry) + '\n')


def handle_add_link(target: str, payload: dict):
    label = strip_html(payload.get('label', '')).strip()
    url = strip_html(payload.get('url', '')).strip()
    if not label or not url.startswith('https://'):
        raise ValueError('add_link requires payload.label and payload.url (https://)')

    changed = []
    if target == 'community':
        p = ROOT / 'content' / 'community.md'
        text = p.read_text(encoding='utf-8')
        if url in text:
            return []
        text += f"\n- {label} — {url}\n"
        p.write_text(text, encoding='utf-8')
        changed.append(str(p.relative_to(ROOT)))
    elif target == 'events':
        p = ROOT / 'content' / 'site.md'
        text = p.read_text(encoding='utf-8')
        if url in text:
            return []
        text += f"\nAdded link: {label} {url}\n"
        p.write_text(text, encoding='utf-8')
        changed.append(str(p.relative_to(ROOT)))
    else:
        p = ROOT / 'content' / 'site.md'
        text = p.read_text(encoding='utf-8')
        text += f"\nAdded {target} link: {label} {url}\n"
        p.write_text(text, encoding='utf-8')
        changed.append(str(p.relative_to(ROOT)))
    return changed


def handle_update_cta(target: str, payload: dict):
    cta_label = strip_html(payload.get('cta_label', '')).strip()
    cta_url = strip_html(payload.get('cta_url', '')).strip()
    if not cta_label or not cta_url.startswith('https://'):
        raise ValueError('update_cta requires payload.cta_label and payload.cta_url (https://)')

    p = ROOT / 'content' / 'site.md'
    text = p.read_text(encoding='utf-8')
    fm, body = parse_frontmatter(text)
    if target == 'home':
        fm['primary_cta_label'] = cta_label
        fm['primary_cta_url'] = cta_url
    elif target == 'community':
        fm['community_cta_label'] = cta_label
        fm['community_cta_url'] = cta_url
    else:
        fm['primary_cta_label'] = cta_label
        fm['primary_cta_url'] = cta_url
    p.write_text(dump_frontmatter(fm, body), encoding='utf-8')
    return [str(p.relative_to(ROOT))]


def handle_update_event(payload: dict):
    title = strip_html(payload.get('event_title', '')).strip()
    date = strip_html(payload.get('event_date', '')).strip()
    location = strip_html(payload.get('event_location', 'Des Moines, IA')).strip()
    url = strip_html(payload.get('url', '')).strip()
    summary = strip_html(payload.get('event_summary', '')).strip() or 'Event update.'

    if not title or not date or not url.startswith('https://'):
        raise ValueError('update_event requires event_title, event_date, and payload.url (https://)')

    if not DATE_RE.match(date):
        raise ValueError(f'event_date must be YYYY-MM-DD, got: {date}')

    slug = re.sub(r'[^a-z0-9-]', '', f"{date}-{title.lower().replace(' ', '-')}")[:80]
    target = safe_content_path(f"events/{slug}.md")
    content = f"""---
title: {title}
date: {date}
location: {location}
luma_url: {url}
status: upcoming
---

{summary}
"""
    target.write_text(content, encoding='utf-8')
    return [str(target.relative_to(ROOT))]


def handle_update_copy(target: str, payload: dict):
    copy = strip_html(payload.get('copy', '')).strip()
    if not copy:
        raise ValueError('update_copy requires payload.copy')
    file_map = {
        'community': ROOT / 'content' / 'community.md',
        'partners': ROOT / 'content' / 'partners.md',
        'home': ROOT / 'content' / 'site.md',
        'events': ROOT / 'content' / 'site.md'
    }
    p = file_map[target]
    text = p.read_text(encoding='utf-8')
    text += f"\n\n{copy}\n"
    p.write_text(text, encoding='utf-8')
    return [str(p.relative_to(ROOT))]


def main():
    import argparse
    ap = argparse.ArgumentParser(description='Execute website intent JSON against markdown content')
    ap.add_argument('--intent-file', required=True)
    args = ap.parse_args()

    data = json.loads(Path(args.intent_file).read_text(encoding='utf-8'))
    intent = data['intent']
    target = data.get('target', '')
    payload = data.get('payload', {})

    if target and target not in ALLOWED_TARGETS:
        raise ValueError(f'Invalid target: {target}. Allowed: {ALLOWED_TARGETS}')

    if intent == 'add_link':
        changed = handle_add_link(target, payload)
    elif intent == 'update_cta':
        changed = handle_update_cta(target, payload)
    elif intent == 'update_event':
        changed = handle_update_event(payload)
    elif intent == 'update_copy':
        changed = handle_update_copy(target, payload)
    else:
        raise ValueError(f'Unsupported intent: {intent}')

    entry = {
        'ts': datetime.utcnow().isoformat() + 'Z',
        'requestedBy': data.get('requestedBy', 'unknown'),
        'intent': intent,
        'target': target,
        'changedFiles': changed
    }
    append_log(entry)
    print(json.dumps({'ok': True, 'changedFiles': changed}, indent=2))


if __name__ == '__main__':
    main()
