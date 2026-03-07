import Nav from '@/components/Nav';
import { getEvents } from '@/lib/content';

export default function EventsPage() {
  const events = getEvents();
  return (
    <>
      <Nav active="events" />
      <section className="hero">
        <div className="kicker">Events</div>
        <h1>Meetups that turn ideas <span className="gradient">into shipped things.</span></h1>
        <p className="lead">All events run through Luma.</p>
      </section>
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
      <footer className="footer"><span>© 2026 vibeDSM</span><span>Events</span></footer>
    </>
  );
}
