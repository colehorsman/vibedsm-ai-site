import Nav from '@/components/Nav';
import { getPageContent } from '@/lib/content';

export default function CommunityPage() {
  const page = getPageContent('community');
  return (
    <>
      <Nav active="community" />
      <section className="hero">
        <div className="kicker">Community</div>
        <h1>{page.frontmatter.intro}</h1>
        <div className="actions">
          <a className="btn btn-primary" href={page.frontmatter.slack_url} target="_blank">Join Slack</a>
          <a className="btn btn-secondary" href="/events">See Events</a>
        </div>
      </section>
      <section className="card prose" dangerouslySetInnerHTML={{ __html: page.html }} />
      <footer className="footer"><span>© 2026 vibeDSM</span><span>Community</span></footer>
    </>
  );
}
