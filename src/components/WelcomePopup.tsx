"use client";

import { useEffect, useState } from "react";

/**
 * First-visit popup offering 10% off in exchange for an email. Shows once
 * per visitor (localStorage), captures the email to Shopify via
 * /api/subscribe, then reveals the discount code.
 */
const DISCOUNT_CODE = "WELCOME10";
const STORAGE_KEY = "sams-welcome-seen";
const SHOW_DELAY_MS = 6000;

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  // Show once, after a short delay.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* still reveal the code — the offer shouldn't depend on the network */
    }
    setStatus("done");
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="10% off your first order"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-crema text-espresso shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-espresso/50 transition-colors hover:bg-espresso/10 hover:text-espresso"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="bg-espresso py-6 text-center">
          <p className="font-script text-3xl text-gold">Sam&apos;s Coffee</p>
        </div>

        <div className="px-8 py-8 text-center">
          {status === "done" ? (
            <>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                You&apos;re in!
              </h2>
              <p className="mt-2 text-espresso/70">
                Use this code at checkout for 10% off your first order:
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="rounded-md border-2 border-dashed border-gold-deep bg-white px-5 py-3 text-2xl font-bold tracking-[0.2em] text-espresso">
                  {DISCOUNT_CODE}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="rounded-md bg-gold px-4 py-3 text-sm font-bold uppercase tracking-wide text-espresso transition-colors hover:bg-gold-deep"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="mt-6 text-sm font-medium uppercase tracking-wide text-espresso/50 underline underline-offset-4 hover:text-espresso"
              >
                Start shopping
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-deep">
                Welcome offer
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-tight tracking-tight">
                Get 10% off
                <br />
                your first order
              </h2>
              <p className="mt-3 text-espresso/70">
                Join our list for a code, plus early access to new single-origin
                lots from Huila.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="w-full rounded-md border border-espresso/20 bg-white px-4 py-3 text-center text-espresso placeholder:text-espresso/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-md bg-gold py-3.5 text-base font-bold uppercase tracking-wide text-espresso transition-colors hover:bg-gold-deep disabled:opacity-60"
                >
                  {status === "loading" ? "…" : "Get my 10% code"}
                </button>
              </form>
              <button
                type="button"
                onClick={dismiss}
                className="mt-4 text-xs font-medium uppercase tracking-wide text-espresso/40 hover:text-espresso"
              >
                No thanks
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
