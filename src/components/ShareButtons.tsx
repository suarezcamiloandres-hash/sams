"use client";

import { useEffect, useState } from "react";

/**
 * Share the current product via WhatsApp, Facebook, X, or copy-link.
 * The URL is read on the client so it works on any domain (Vercel or the
 * final samscoffee.com.au).
 */
export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setUrl(window.location.href), []);

  const shareText = `${title} — Sam's Coffee`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(shareText);

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-espresso/10 pt-6">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-espresso/50">
        Share
      </span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-espresso/20 px-4 py-2 text-sm font-medium text-espresso/80 transition-colors hover:border-gold hover:bg-gold/10 hover:text-espresso"
        >
          {link.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-espresso/20 px-4 py-2 text-sm font-medium text-espresso/80 transition-colors hover:border-gold hover:bg-gold/10 hover:text-espresso focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
