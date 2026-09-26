"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="page">
          <section className="card" aria-labelledby="global-error-title">
            <h1 id="global-error-title" className="title">Something went wrong</h1>
            <p className="subtitle">Please try loading the notification console again.</p>
            <button className="btn-primary" type="button" onClick={() => reset()}>
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
