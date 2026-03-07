import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');

export type SiteConfig = {
  name: string;
  tagline: string;
  city: string;
  domain: string;
  primary_cta_label: string;
  primary_cta_url: string;
  community_cta_label: string;
  community_cta_url: string;
  contact_email: string;
  hero_title: string;
  hero_subtitle: string;
};

export type EventItem = {
  slug: string;
  title: string;
  date: string;
  location: string;
  luma_url: string;
  status: string;
  summary: string;
};

export type ExternalEventItem = {
  slug: string;
  title: string;
  org: string;
  city: string;
  date: string;
  url: string;
  source: string;
  summary: string;
};

function readMarkdown(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return { data, content };
}

export function getSiteConfig(): SiteConfig {
  const { data } = readMarkdown(path.join(CONTENT_DIR, 'site.md'));
  return data as SiteConfig;
}

export function getPageContent(page: 'community' | 'partners') {
  const { data, content } = readMarkdown(path.join(CONTENT_DIR, `${page}.md`));
  return {
    frontmatter: data as Record<string, string>,
    html: sanitizeHtml(marked.parse(content) as string, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title'],
        a: ['href', 'target', 'rel']
      },
      allowedSchemes: ['https', 'mailto']
    })
  };
}

export function getEvents(): EventItem[] {
  const eventsDir = path.join(CONTENT_DIR, 'events');
  const files = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.md'));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const { data, content } = readMarkdown(path.join(eventsDir, file));
      return {
        slug,
        title: String(data.title || slug),
        date: String(data.date || ''),
        location: String(data.location || ''),
        luma_url: String(data.luma_url || '#'),
        status: String(data.status || 'upcoming'),
        summary: content.trim()
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getLatestLumaEventUrl(): string | null {
  const events = getEvents();
  const valid = events.find(
    (e) => e.luma_url.startsWith('https://luma.com/') && !e.luma_url.includes('REPLACE')
  );
  return valid?.luma_url ?? null;
}

export function getExternalEvents(cityFilter = 'Des Moines'): ExternalEventItem[] {
  const eventsDir = path.join(CONTENT_DIR, 'external-events');
  if (!fs.existsSync(eventsDir)) return [];
  const files = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.md'));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const { data, content } = readMarkdown(path.join(eventsDir, file));
      return {
        slug,
        title: String(data.title || slug),
        org: String(data.org || 'Community'),
        city: String(data.city || ''),
        date: String(data.date || ''),
        url: String(data.url || '#'),
        source: String(data.source || 'manual'),
        summary: content.trim()
      };
    })
    .filter((e) => !cityFilter || e.city.toLowerCase().includes(cityFilter.toLowerCase()))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
