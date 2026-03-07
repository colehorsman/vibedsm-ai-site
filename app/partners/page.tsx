import Nav from '@/components/Nav';
import { getPageContent, getSiteConfig } from '@/lib/content';

export default function PartnersPage() {
  const page = getPageContent('partners');
  const site = getSiteConfig();
  return (
    <>
      <Nav active="partners" />
      <section className="hero">
        <div className="kicker">Partners</div>
        <h1>{page.frontmatter.intro}</h1>
        <div className="actions">
          <a className="btn btn-primary" href={`mailto:${site.contact_email}`}>Contact {site.contact_email}</a>
        </div>
      </section>
      <section className="card prose" dangerouslySetInnerHTML={{ __html: page.html }} />
      <footer className="footer"><span>© 2026 vibeDSM</span><span>Partners</span></footer>
    </>
  );
}
