# vibeDSM AI Site

AI-first community site for [vibeDSM](https://vibedsm.ai) — a monthly meetup for developers, founders, designers, and AI-curious builders in Des Moines, Iowa.

## What this demonstrates
This project is a **mostly hands-off, AI-managed website**:
- You request changes in chat (e.g., "add link X to page Y")
- AI applies markdown/content updates
- GitHub PR is opened automatically for approval
- Merge auto-deploys to production (Vercel)
- Daily QA + security + Lighthouse checks run automatically
- Results are posted to Slack

## Stack
- **Next.js 14** (App Router, standalone output)
- **Markdown-driven content** (gray-matter + marked)
- **Intent-based automation** (Python scripts + GitHub Actions)
- **Vercel** for hosting with auto-deploy on push to main
- **Dependabot** for automated dependency security scanning

## Live
- **Site:** https://vibedsm.ai (or https://vibedsm-ai-site.vercel.app)
- **Repo:** https://github.com/colehorsman/vibedsm-ai-site

## Run locally
```bash
npm install
npm run content:validate
npm run dev
```

## Content files
All site content lives in markdown with YAML frontmatter:
- `content/site.md` — homepage config (title, tagline, CTAs, contact)
- `content/events/*.md` — vibeDSM hosted events
- `content/external-events/*.md` — other local AI events (ecosystem feed)
- `content/community.md` — community/Slack page
- `content/partners.md` — sponsorship and hosting

## AI management model
This site is designed to be managed by AI agents:
- **Routine content updates** — AI edits markdown directly via intent system
- **Structural/code changes** — require PR review
- **All changes** — must pass `content-check` workflow validation
- **Production deploys** — only from `main` branch via Vercel Git integration

### Intent-driven automation
Content edits can be triggered programmatically via the intent system, auto-opening PRs:

**Supported intents:**
| Intent | Description |
|--------|-------------|
| `add_link` | Add links to community/partners/events pages |
| `update_cta` | Change primary CTAs on homepage |
| `update_event` | Create or update event files |
| `update_copy` | Append content to page copy |
| `add_external_event` | Add an external/local AI event card |

**Trigger via GitHub Actions:**
Workflow: `.github/workflows/intent-pr.yml`

Example payload:
```json
{
  "intent": "add_link",
  "target": "community",
  "requestedBy": "cole",
  "reason": "Add Slack invite CTA",
  "payload": {
    "label": "Join vibeDSM Slack",
    "url": "https://example.com/your-invite-link"
  }
}
```

**Local test:**
```bash
python3 scripts/execute_intent.py --intent-file commands/examples/add-link-community.json
python3 scripts/validate_content.py
```

## Deployment
- Vercel auto-deploys on push to `main`
- Dependabot opens PRs for dependency updates automatically

### Custom domain
DNS is managed via Cloudflare. See Vercel docs for custom domain setup.

## Policies
- `policies/ai-edit-policy.yaml` — guardrails for AI edits (content-only, PR required, no silent deploys)
- `AI_WORKFLOW.md` — AI update playbook and human-in-the-loop rules

## Contributing
This is an open-source project for the Des Moines AI community. PRs welcome for:
- New event content
- Design improvements
- Accessibility fixes
- New intent types for automation

## Automation
Content updates can be triggered via Slack or other integrations through the intent system. See `AI_WORKFLOW.md` for the full playbook.

## Daily QA (automated)
- Workflow: `.github/workflows/daily-site-qa.yml`
- Script: `scripts/site_qa.mjs`
- Checks performed daily:
  - Link validation
  - Security header checks
  - Browser console/runtime errors
  - Core page rendering status
  - Analytics signal detection
- Reports are uploaded as GitHub Actions artifacts (`qa-reports/site-qa-report.md` and `.json`).
- If security findings exist, automation creates/updates a GitHub issue (`security`, `automated-qa`).

## Daily Lighthouse (regression-quality guard)
- Workflow: `.github/workflows/daily-lighthouse.yml`
- Config: `lighthouserc.json`
- Categories tracked:
  - Performance
  - Accessibility
  - Best Practices
  - SEO
- This functions as **website quality regression testing** over time.

## Uptime monitoring + Slack alerts
- Workflow: `.github/workflows/uptime-monitor.yml`
- Script: `scripts/uptime_check.py`
- Checks site endpoints every 15 minutes
- Sends Slack alert when any monitored page is inaccessible
