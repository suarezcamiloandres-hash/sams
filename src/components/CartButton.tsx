"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/money";

/**
 * Floating cart "island" (top-right) + slide-in cart drawer. Items are added
 * via the cart context; Checkout builds a Shopify cart and redirects.
 */
export default function CartButton() {
  const {
    items,
    count,
    subtotal,
    currencyCode,
    isOpen,
    open,
    close,
    updateQuantity,
    removeItem,
  } = useCart();

  const [bump, setBump] = useState(false);
  const [loading, setLoading] = useState(false);

  // Little pop when the item count changes.
  useEffect(() => {
    if (count === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(t);
  }, [count]);

  // Close drawer on Escape + lock scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  async function checkout() {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating island */}
      <button
        type="button"
        onClick={open}
        aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
        className={`group fixed right-4 top-14 z-[70] flex items-center gap-2 rounded-full border border-gold/50 bg-espresso/95 py-2.5 pl-4 pr-3 text-crema shadow-2xl backdrop-blur transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold md:top-16 ${
          bump ? "scale-110" : ""
        }`}
      >
        <span className="text-sm font-semibold uppercase tracking-wide max-sm:hidden">
          Cart
        </span>
        <span className="relative flex size-9 items-center justify-center rounded-full bg-gold text-espresso">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
            <path d="M6 6L5 3H2" strokeLinecap="round" />
          </svg>
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-espresso px-1.5 text-xs font-bold text-gold ring-2 ring-gold">
              {count}
            </span>
          )}
        </span>
      </button>

      {/* Drawer + backdrop */}
      <div
        className={`fixed inset-0 z-[110] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={close}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-crema text-espresso shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <header className="flex items-center justify-between border-b border-espresso/10 px-6 py-5">
            <h2 className="text-lg font-bold uppercase tracking-wide">
              Your cart {count > 0 && <span className="text-gold-deep">({count})</span>}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close cart"
              className="flex size-9 items-center justify-center rounded-full text-espresso/60 transition-colors hover:bg-espresso/5 hover:text-espresso"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-espresso/60">Your cart is empty.</p>
              <button
                type="button"
                onClick={close}
                className="rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-espresso transition-colors hover:bg-gold-deep"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y divide-espresso/10 overflow-y-auto px-6">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 py-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-espresso/10 bg-white">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="size-full object-contain"
                        />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-2 text-sm font-semibold">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm text-gold-deep">
                        {formatMoney(item.amount, item.currencyCode)}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-sm border border-espresso/20">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="flex size-8 items-center justify-center text-lg text-espresso/70 hover:bg-espresso/5"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            className="flex size-8 items-center justify-center text-lg text-espresso/70 hover:bg-espresso/5"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="text-xs font-medium uppercase tracking-wide text-espresso/40 underline underline-offset-2 hover:text-espresso"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <footer className="border-t border-espresso/10 px-6 py-5">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    {formatMoney(subtotal, currencyCode)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-espresso/50">
                  Shipping &amp; taxes calculated at checkout · free postage.
                </p>
                <button
                  type="button"
                  onClick={checkout}
                  disabled={loading}
                  className="mt-4 w-full rounded-sm bg-gold py-4 text-base font-bold uppercase tracking-wide text-espresso transition-colors hover:bg-gold-deep disabled:opacity-60"
                >
                  {loading ? "Loading…" : "Checkout"}
                </button>
              </footer>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
