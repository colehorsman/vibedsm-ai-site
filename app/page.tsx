import Nav from '@/components/Nav';
import { getSiteConfig } from '@/lib/content';

export default function HomePage() {
  const site = getSiteConfig();

  return (
    <>
      <Nav active="home" />
      <section className="hero">
        <div className="kicker">Monthly meetup • {site.city}</div>
        <h1>{site.hero_title}<br /><span className="gradient">{site.hero_subtitle}</span></h1>
        <p className="lead">{site.tagline}</p>
        <div className="actions">
          <a className="btn btn-primary" href={site.primary_cta_url} target="_blank">{site.primary_cta_label}</a>
          <a className="btn btn-secondary" href={site.community_cta_url} target="_blank">{site.community_cta_label}</a>
          <a className="btn btn-secondary" href="/events">See Events</a>
        </div>
      </section>
      <section className="sections">
        <article className="card"><h3>Events</h3><p>Upcoming meetups, recaps, and RSVP links.</p><a href="/events">Open events →</a></article>
        <article className="card"><h3>Community</h3><p>Slack-first collaboration between meetup nights.</p><a href="/community">Open community →</a></article>
        <article className="card"><h3>Partners</h3><p>Support local builders through hosting and sponsorship.</p><a href="/partners">Open partners →</a></article>
      </section>
      <footer className="footer"><span>© 2026 vibeDSM</span><span>{site.domain}</span></footer>
    </>
  );
}
