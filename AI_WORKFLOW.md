# AI-First Workflow (vibeDSM)

## Intent
Site is designed to be built, updated, and managed by AI with markdown as source of truth.

## Source of Truth
- `content/site.md`
- `content/events/*.md`
- `content/community.md`
- `content/partners.md`

## Human-in-the-loop guardrails
1. AI edits content markdown only for normal updates.
2. Structural UI changes require PR review.
3. All PRs must pass `content-check` workflow.
4. Production deploy only from `main` branch.

## AI update playbook
1. Update markdown files.
2. Run `python3 scripts/validate_content.py`.
3. Commit with clear message.
4. Open PR with summary and screenshots.
5. Merge to `main` for auto-deploy on Vercel.

## Future enhancements
- Add structured schema validation (JSON Schema)
- Add image optimization pipeline
- Add event ingest from Luma API (if available)
- Add automated changelog generation from content diffs
