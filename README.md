# vibeDSM AI Site (Next.js + Markdown)

Best-in-class **AI-first** starter for `vibedsm.ai`:
- Modern Next.js app-router site
- Markdown-driven content
- AI workflow contract and validation
- GitHub + Vercel ready

## Why this stack
- **Modern UX:** Next.js routing/perf and easy expansion
- **MD source-of-truth:** non-dev updates, agent-friendly edits
- **AI operability:** guardrails in `AI_WORKFLOW.md`

## Run locally
```bash
npm install
npm run content:validate
npm run dev
```

## Content files to edit
- `content/site.md`
- `content/events/*.md`
- `content/community.md`
- `content/partners.md`

## Required immediate edits
- Replace Slack invite URLs in:
  - `content/site.md`
  - `content/community.md`
- Replace second event placeholder:
  - `content/events/2026-02-placeholder.md`

## GitHub + Vercel deploy
1. Push repo to GitHub
2. Import repo in Vercel
3. Framework preset: Next.js (auto-detected)
4. Deploy
5. Add domain `vibedsm.ai`

## Cloudflare DNS for Vercel
- `@` A → `76.76.21.21`
- `www` CNAME → `cname.vercel-dns.com`

## AI management model
- AI updates markdown for routine changes
- PR review for structural changes
- content-check workflow validates content schema basics

## Intent-driven automation (R1/Slack style)
You can trigger automated content edits and open a PR with the `intent-pr` GitHub Action.

### Local test
```bash
python3 scripts/execute_intent.py --intent-file commands/examples/add-link-community.json
python3 scripts/validate_content.py
```

### GitHub Action trigger input
Workflow: `.github/workflows/intent-pr.yml`
Input key: `intent_json`

Example payload:
```json
{
  "intent": "add_link",
  "target": "community",
  "requestedBy": "cole",
  "reason": "Add Slack invite CTA",
  "payload": {
    "label": "Join vibeDSM Slack",
    "url": "https://join.slack.com/t/REPLACE_ME"
  }
}
```

This will:
1. apply markdown change
2. run content validation
3. open a PR for your approval
4. deploy on merge (via Vercel Git integration)
