"use client";

import { useState } from "react";

/**
 * Quantity stepper + Buy now button for the product detail page. Passes the
 * chosen quantity through to /api/checkout, which builds the Shopify cart.
 */
type Props = {
  variantId: string | null;
  price: string;
  available: boolean;
};

const MAX_QTY = 99;

export default function BuyControls({ variantId, price, available }: Props) {
  const [qty, setQty] = useState(1);

  const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, n));
  const checkoutHref = variantId
    ? `/api/checkout?variant=${encodeURIComponent(variantId)}&qty=${qty}`
    : "/api/checkout";

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      {/* Quantity stepper */}
      <div className="flex items-center rounded-sm border border-espresso/20">
        <button
          type="button"
          onClick={() => setQty((q) => clamp(q - 1))}
          aria-label="Decrease quantity"
          className="flex size-12 items-center justify-center text-2xl text-espresso/70 transition-colors hover:bg-espresso/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-30"
          disabled={qty <= 1}
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={MAX_QTY}
          value={qty}
          onChange={(e) => setQty(clamp(Number(e.target.value)))}
          aria-label="Quantity"
          className="w-14 border-x border-espresso/20 bg-transparent py-3 text-center text-lg font-semibold tabular-nums [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => setQty((q) => clamp(q + 1))}
          aria-label="Increase quantity"
          className="flex size-12 items-center justify-center text-2xl text-espresso/70 transition-colors hover:bg-espresso/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-30"
          disabled={qty >= MAX_QTY}
        >
          +
        </button>
      </div>

      <a
        href={checkoutHref}
        className="inline-block rounded-sm bg-gold px-8 py-4 text-lg font-bold uppercase tracking-wide text-espresso transition-colors duration-150 hover:bg-gold-deep md:text-xl"
      >
        Buy now — {price}
      </a>

      {!available && (
        <span className="text-sm font-semibold uppercase tracking-wide text-espresso/50">
          Currently out of stock
        </span>
      )}
    </div>
  );
}
