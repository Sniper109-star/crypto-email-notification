"use client";

import { useEffect } from "react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v0] Application route error");
  }, []);

  return (
    <main className="page">
      <section className="card" aria-labelledby="error-title">
        <h1 id="error-title" className="title">Something went wrong</h1>
        <p className="subtitle">The console could not load this request.</p>
        <button className="btn-primary" type="button" onClick={() => reset()}>
          Try again
        </button>
      </section>
    </main>
  );
}
