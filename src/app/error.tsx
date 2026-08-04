"use client";

import { useEffect } from "react";

/**
 * Route error boundary. Its main job is to survive "deployment skew": after
 * a new version ships, a tab still running the old build asks for JS chunks
 * that no longer exist and throws on navigation. We detect that and reload
 * to the fresh version automatically, so the visitor never gets stranded on
 * an error screen. Anything else shows a friendly retry.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = `${error?.name ?? ""} ${error?.message ?? ""}`;
    const isStaleBuild =
      /ChunkLoadError|Loading chunk|dynamically imported module|importing a module script failed|failed to fetch/i.test(
        msg,
      );
    if (isStaleBuild) {
      window.location.reload();
    }
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-5 bg-crema px-6 pt-32 text-center text-espresso">
      <p className="font-script text-3xl text-gold">Sam&apos;s Coffee</p>
      <h1 className="text-2xl font-bold uppercase tracking-tight">
        Just a moment…
      </h1>
      <p className="max-w-sm text-espresso/70">
        We hit a small hiccup loading this page. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-espresso transition-colors hover:bg-gold-deep"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-sm border-2 border-espresso px-6 py-3 text-sm font-bold uppercase tracking-wide text-espresso transition-colors hover:bg-espresso hover:text-crema"
        >
          Go home
        </a>
      </div>
    </section>
  );
}
