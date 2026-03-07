import Link from 'next/link';

export default function Nav({ active }: { active: 'home' | 'events' | 'community' | 'partners' }) {
  const cls = (key: string) => `pill ${active === key ? 'active' : ''}`;
  return (
    <header className="nav">
      <Link className="brand" href="/">
        vibeDSM
        <small>Des Moines AI Builders</small>
      </Link>
      <nav className="nav-links">
        <Link className={cls('home')} href="/">Home</Link>
        <Link className={cls('events')} href="/events">Events</Link>
        <Link className={cls('community')} href="/community">Community</Link>
        <Link className={cls('partners')} href="/partners">Partners</Link>
      </nav>
    </header>
  );
}
