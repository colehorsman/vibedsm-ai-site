#!/usr/bin/env python3
import json
import os
import pathlib
import urllib.request
import urllib.error
from datetime import datetime

URLS = [
    "https://vibedsm.ai/",
    "https://vibedsm.ai/events",
    "https://vibedsm.ai/community",
    "https://vibedsm.ai/partners",
]

STATE_FILE = pathlib.Path('.uptime-state.json')


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            return {}
    return {}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def check_url(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": "vibedsm-uptime-check/1.0"})
    try:
      with urllib.request.urlopen(req, timeout=timeout) as r:
          code = r.getcode()
          return {"ok": 200 <= code < 400, "status": code, "error": None}
    except urllib.error.HTTPError as e:
        return {"ok": False, "status": e.code, "error": str(e)}
    except Exception as e:
        return {"ok": False, "status": None, "error": str(e)}


def post_slack(text):
    webhook = os.getenv('SLACK_WEBHOOK_URL', '').strip()
    if not webhook:
        print('SLACK_WEBHOOK_URL missing; cannot post alert')
        return
    payload = json.dumps({"text": text}).encode('utf-8')
    req = urllib.request.Request(webhook, data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        print('Slack post status:', resp.status)


def main():
    now = datetime.utcnow().isoformat() + 'Z'
    prev = load_state()
    new = {}

    failures = []
    recovered = []

    for url in URLS:
        result = check_url(url)
        new[url] = result
        was_ok = bool(prev.get(url, {}).get('ok', True))

        if not result['ok']:
            failures.append((url, result))
        if result['ok'] and not was_ok:
            recovered.append((url, result))

    # Alert on new/current failures
    if failures:
        lines = [
            f"🚨 *vibeDSM Uptime Alert*",
            f"• Time: {now}",
            f"• Failing endpoints: {len(failures)}",
        ]
        for url, res in failures:
            lines.append(f"• {url} → status={res['status']} error={res['error'] or 'n/a'}")
        run_url = os.getenv('GITHUB_SERVER_URL', 'https://github.com') + '/' + os.getenv('GITHUB_REPOSITORY', '') + '/actions/runs/' + os.getenv('GITHUB_RUN_ID', '')
        if os.getenv('GITHUB_REPOSITORY') and os.getenv('GITHUB_RUN_ID'):
            lines.append(f"• Run: {run_url}")
        post_slack("\n".join(lines))
    elif recovered:
        lines = [
            f"✅ *vibeDSM Recovery*",
            f"• Time: {now}",
            f"• Recovered endpoints: {len(recovered)}",
        ]
        for url, res in recovered:
            lines.append(f"• {url} is back (status={res['status']})")
        post_slack("\n".join(lines))

    save_state(new)

    # Fail job if any endpoint down
    if failures:
        raise SystemExit(1)

    print('All monitored endpoints healthy.')


if __name__ == '__main__':
    main()
