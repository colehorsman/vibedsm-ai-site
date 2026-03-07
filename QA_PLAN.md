# vibeDSM QA Plan (Automated + Daily)

## Automated categories covered (daily)
1. **Links**
   - Crawls links from Home / Events / Community / Partners
   - Checks HTTP status; flags 4xx/5xx and network failures
2. **Security**
   - Checks for key headers:
     - strict-transport-security
     - content-security-policy
     - x-content-type-options
     - referrer-policy
3. **Errors**
   - Captures browser console errors
   - Captures uncaught page exceptions
4. **Rendering**
   - Verifies core pages return healthy status and load
5. **Analytics detection**
   - Verifies whether common analytics scripts are present

## Workflow
- GitHub Action: `.github/workflows/daily-site-qa.yml`
- Script: `scripts/site_qa.mjs`
- Output artifacts: `qa-reports/site-qa-report.{json,md}`
- Auto-ticketing: creates/updates GitHub issue labeled `security, automated-qa` when security findings are detected

## Optional hardening to add next
- Add Lighthouse CI (performance + accessibility + SEO)
- Add OWASP ZAP baseline scan
- Add uptime monitor and alerting (Better Stack/UptimeRobot)
- Add broken image checks

## Traffic analytics recommendation
Because domain is on Cloudflare, enable **Cloudflare Web Analytics** for simple visitor counts and traffic origin without cookie banners.

Cloudflare dashboard path:
- Analytics & Logs -> Web Analytics -> Add site `vibedsm.ai`
