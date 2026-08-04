"use client";

import { useEffect } from "react";

/**
 * Root error handler. This is what replaces the default
 * "Application error: a client-side exception has occurred" screen.
 *
 * - On a stale-build / chunk error (typical right after a new deploy),
 *   reload once to pick up the fresh version.
 * - Otherwise show the error text so it can be diagnosed from a screenshot.
 */
export default function GlobalError({
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
    if (isStaleBuild && !sessionStorage.getItem("reloaded-once")) {
      sessionStorage.setItem("reloaded-once", "1");
      window.location.reload();
    }
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          background: "#F7F3EB",
          color: "#1D1207",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 800, textTransform: "uppercase" }}>
          Just a moment…
        </h1>
        <p style={{ maxWidth: "28rem", opacity: 0.7 }}>
          We hit a small hiccup loading this page. Please try again.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#C89B4A",
              color: "#1D1207",
              border: "none",
              borderRadius: "4px",
              padding: "12px 24px",
              fontWeight: 700,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              border: "2px solid #1D1207",
              color: "#1D1207",
              borderRadius: "4px",
              padding: "10px 24px",
              fontWeight: 700,
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Go home
          </a>
        </div>
        {/* Temporary diagnostic — shows the real error so we can pinpoint it. */}
        <pre
          style={{
            marginTop: "8px",
            maxWidth: "40rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "12px",
            opacity: 0.6,
          }}
        >
          {error?.name}: {error?.message}
          {error?.digest ? `\ndigest: ${error.digest}` : ""}
        </pre>
      </body>
    </html>
  );
}
