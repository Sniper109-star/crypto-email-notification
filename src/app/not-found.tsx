import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <section className="card" aria-labelledby="not-found-title">
        <h1 id="not-found-title" className="title">Page not found</h1>
        <p className="subtitle">The notification console route you requested does not exist.</p>
        <Link className="btn-primary" href="/">Return to console</Link>
      </section>
    </main>
  );
}
