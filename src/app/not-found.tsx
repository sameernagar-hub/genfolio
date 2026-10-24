import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm text-accent">404 · route not found</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">This page failed its health check.</h1>
        <p className="mt-3 text-muted">Unlike the services on the homepage, it has no SLA.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg">
          Back to the portfolio
        </Link>
      </div>
    </main>
  );
}
