import Nav from '@/components/Nav';
import { getEvents, getExternalEvents } from '@/lib/content';

export default function EventsPage() {
  const events = getEvents();
  const externalEvents = getExternalEvents('Des Moines');
  return (
    <>
      <Nav active="events" />
      <section className="hero">
        <div className="kicker">Events</div>
        <h1>Meetups that turn ideas <span className="gradient">into shipped things.</span></h1>
        <p className="lead">All events run through Luma.</p>
      </section>
      <h2 style={{ marginTop: 18 }}>vibeDSM Events</h2>
      <section className="sections">
        {events.map((event) => (
          <article className="card" key={event.slug}>
            <h3>{event.title}</h3>
            <p>{event.date} • {event.location}</p>
            <p>{event.summary}</p>
            <a href={event.luma_url} target="_blank">View on Luma →</a>
          </article>
        ))}
      </section>

      <h2 style={{ marginTop: 28 }}>Other Local AI Events (Des Moines)</h2>
      <section className="sections">
        {externalEvents.length === 0 ? (
          <article className="card"><h3>No external events yet</h3><p>Add markdown files under <code>content/external-events/</code>.</p></article>
        ) : externalEvents.map((event) => (
          <article className="card" key={event.slug}>
            <h3>{event.title}</h3>
            <p>{event.date} • {event.city} • {event.org}</p>
            <p>{event.summary}</p>
            <a href={event.url} target="_blank">Open event →</a>
          </article>
        ))}
      </section>

      <footer className="footer"><span>© 2026 vibeDSM</span><span>Events + Ecosystem</span></footer>
    </>
  );
}
