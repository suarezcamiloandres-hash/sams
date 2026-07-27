"use client";

import { useEffect, useState } from "react";

/**
 * Persistent floating "island" button that opens the brand film in a modal.
 * Always visible (fixed, bottom-right) so the video is one click away from
 * anywhere on the page.
 *
 * Note: for the video to play, Vimeo → Settings → Privacy → "Where can this
 * be embedded?" must allow this site (or "Anywhere").
 */
const VIMEO_ID = "1200491813";

export default function VideoButton() {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Floating island button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Watch our film"
        className="group fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full border border-gold/50 bg-espresso/95 py-3 pl-3 pr-5 text-crema shadow-2xl backdrop-blur transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold md:bottom-8 md:right-8"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-gold text-espresso transition-transform duration-200 group-hover:scale-110">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="text-sm font-semibold uppercase tracking-wide max-sm:hidden">
          Watch our film
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Sam's Coffee film"
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute -top-11 right-0 flex size-9 items-center justify-center rounded-full border border-crema/30 text-crema transition-colors hover:bg-crema/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gold/30 shadow-2xl">
              <iframe
                src={`https://player.vimeo.com/video/${VIMEO_ID}?autoplay=1`}
                title="Sam's Coffee — brand film"
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
