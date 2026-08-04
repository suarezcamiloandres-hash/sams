"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart-context";

export type ShopProduct = {
  id: string;
  title: string;
  price: string;
  amount: number;
  currencyCode: string;
  imageUrl: string | null;
  imageAlt: string;
  available: boolean;
  variantId: string | null;
};

export default function ShopGrid({ products }: { products: ShopProduct[] }) {
  const { addItem } = useCart();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <article
          key={p.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-espresso/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
          <Link
            href={`/products/${p.id}`}
            className="relative block aspect-square overflow-hidden bg-crema-2"
          >
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.imageAlt}
                className="size-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-espresso/40">
                No image
              </span>
            )}
            {!p.available && (
              <span className="absolute left-3 top-3 rounded-full bg-espresso/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-crema">
                Sold out
              </span>
            )}
          </Link>

          <div className="flex flex-1 flex-col p-5">
            <Link href={`/products/${p.id}`}>
              <h3 className="line-clamp-2 text-balance font-semibold leading-snug text-espresso transition-colors group-hover:text-gold-deep">
                {p.title}
              </h3>
            </Link>
            <p className="mt-1 text-lg font-bold text-gold-deep">{p.price}</p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  p.variantId &&
                  addItem({
                    variantId: p.variantId,
                    handle: p.id,
                    title: p.title,
                    imageUrl: p.imageUrl,
                    amount: p.amount,
                    currencyCode: p.currencyCode,
                  })
                }
                disabled={!p.variantId || !p.available}
                className="flex-1 rounded-sm border-2 border-espresso py-2.5 text-sm font-bold uppercase tracking-wide text-espresso transition-colors hover:bg-espresso hover:text-crema disabled:opacity-40"
              >
                Add to cart
              </button>
              <Link
                href={`/products/${p.id}`}
                className="rounded-sm bg-gold px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-espresso transition-colors hover:bg-gold-deep"
              >
                Details
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
