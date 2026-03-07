import { chromium, request as playwrightRequest } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.SITE_URL || 'https://vibedsm.ai';
const pages = ['/', '/events', '/community', '/partners'];
const outDir = path.join(process.cwd(), 'qa-reports');
fs.mkdirSync(outDir, { recursive: true });

const report = {
  ts: new Date().toISOString(),
  site: baseURL,
  categories: {
    links: { checked: 0, failed: [] },
    security: { headers: {}, warnings: [] },
    errors: { console: [], page: [] },
    render: { pages: [] },
    analytics: { detected: false, notes: [] }
  }
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const api = await playwrightRequest.newContext();

const seenLinks = new Set();

for (const route of pages) {
  const url = new URL(route, baseURL).toString();
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') report.categories.errors.console.push({ page: route, text: msg.text() });
  });
  page.on('pageerror', (err) => {
    report.categories.errors.page.push({ page: route, text: String(err) });
  });

  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  const status = resp?.status() ?? 0;
  report.categories.render.pages.push({ page: route, status, ok: status >= 200 && status < 400 });

  // basic page sanity
  const title = await page.title();
  if (!title || title.trim().length < 3) {
    report.categories.render.pages.push({ page: route, warning: 'Missing/short title' });
  }

  // detect common analytics signals
  const html = await page.content();
  if (/cloudflareinsights\.com|plausible\.io|googletagmanager|analytics/i.test(html)) {
    report.categories.analytics.detected = true;
  }

  const hrefs = await page.$$eval('a[href]', (els) => els.map((e) => e.getAttribute('href')).filter(Boolean));
  for (const rawHref of hrefs) {
    const href = rawHref.trim();
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;

    let target;
    try { target = new URL(href, url).toString(); } catch { continue; }
    if (seenLinks.has(target)) continue;
    seenLinks.add(target);

    report.categories.links.checked += 1;
    try {
      const r = await api.get(target, { timeout: 15000, failOnStatusCode: false });
      const code = r.status();
      if (code >= 400) report.categories.links.failed.push({ url: target, status: code });
    } catch (e) {
      report.categories.links.failed.push({ url: target, status: 'error', error: String(e) });
    }
  }

  await page.close();
}

// Security header checks on home page
const homeResp = await api.get(baseURL, { failOnStatusCode: false, timeout: 20000 });
const headers = homeResp.headers();
const secHeaders = ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'referrer-policy'];
for (const h of secHeaders) {
  report.categories.security.headers[h] = headers[h] || null;
  if (!headers[h]) report.categories.security.warnings.push(`Missing security header: ${h}`);
}

if (!report.categories.analytics.detected) {
  report.categories.analytics.notes.push('No known analytics script detected. Consider Cloudflare Web Analytics.');
}

await api.dispose();
await browser.close();

const jsonPath = path.join(outDir, 'site-qa-report.json');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const md = `# vibeDSM Daily QA Report\n\n- Time: ${report.ts}\n- Site: ${report.site}\n\n## Links\n- Checked: ${report.categories.links.checked}\n- Failed: ${report.categories.links.failed.length}\n${report.categories.links.failed.map(f => `  - ${f.url} (${f.status})`).join('\n') || '  - none'}\n\n## Security\n${Object.entries(report.categories.security.headers).map(([k,v]) => `- ${k}: ${v || 'MISSING'}`).join('\n')}\n${report.categories.security.warnings.length ? '\nWarnings:\n' + report.categories.security.warnings.map(w => `- ${w}`).join('\n') : ''}\n\n## Errors\n- Console errors: ${report.categories.errors.console.length}\n- Page errors: ${report.categories.errors.page.length}\n\n## Rendering\n${report.categories.render.pages.map(p => `- ${p.page}: ${p.status || p.warning} ${p.ok === false ? '❌' : '✅'}`).join('\n')}\n\n## Analytics\n- Detected: ${report.categories.analytics.detected ? 'yes' : 'no'}\n${report.categories.analytics.notes.map(n => `- ${n}`).join('\n')}\n`;

const mdPath = path.join(outDir, 'site-qa-report.md');
fs.writeFileSync(mdPath, md);

console.log(`QA report generated:\n- ${jsonPath}\n- ${mdPath}`);

if (report.categories.links.failed.length || report.categories.errors.console.length || report.categories.errors.page.length) {
  process.exitCode = 1;
}
