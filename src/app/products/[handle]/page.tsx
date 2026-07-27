import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProduct } from "@/lib/shopify";

// Rendered on demand (queries Shopify at request time, not build time).
export const dynamic = "force-dynamic";

type Params = { handle: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const product = await getProduct(params.handle);
  return {
    title: product ? `${product.title} — Sam's Coffee` : "Sam's Coffee",
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProduct(params.handle);
  if (!product) notFound();

  const checkoutHref = product.variantId
    ? `/api/checkout?variant=${encodeURIComponent(product.variantId)}`
    : "/api/checkout";

  return (
    <section className="min-h-screen bg-crema px-6 pb-24 pt-32 text-espresso">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-espresso/60 transition-colors hover:text-espresso"
        >
          <span aria-hidden>←</span> Back to shop
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
          {/* Image */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-espresso/10 bg-white shadow-sm">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  className="aspect-square w-full object-contain"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center text-espresso/40">
                  No image
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.slice(0, 5).map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.url}
                    src={img.url}
                    alt={img.alt}
                    className="size-16 rounded-lg border border-espresso/10 bg-white object-contain p-1"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-balance text-3xl font-black leading-tight md:text-4xl">
              {product.title}
            </h1>
            <p className="mt-4 text-3xl font-bold text-gold-deep md:text-4xl">
              {product.price}
            </p>

            {product.descriptionHtml && (
              <div
                className="mt-6 max-w-prose leading-relaxed text-espresso/80 [&_a]:text-gold-deep [&_a]:underline [&_li]:mb-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:ml-5 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={checkoutHref}
                className="inline-block rounded-sm bg-gold px-8 py-4 text-lg font-bold uppercase tracking-wide text-espresso transition-colors duration-150 hover:bg-gold-deep md:text-xl"
              >
                Buy now — {product.price}
              </a>
              {!product.available && (
                <span className="text-sm font-semibold uppercase tracking-wide text-espresso/50">
                  Currently out of stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
