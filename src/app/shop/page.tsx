import { Metadata } from "next";

import { getProducts } from "@/lib/shopify";
import ShopGrid from "@/components/ShopGrid";

// Fetches live products at request time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Coffees — Sam's Coffee",
  description:
    "Browse every specialty Colombian coffee from Sam's Coffee — single origin, grown in Huila and roasted in Brisbane.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <section className="min-h-screen bg-crema px-6 pb-24 pt-32 text-espresso">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-deep">
            Our Coffees
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight md:text-5xl">
            Shop all coffees
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-espresso/70">
            Specialty Colombian coffee, grown between 1,600 and 2,000 metres in
            Huila and roasted to order in Brisbane.
          </p>
        </header>

        <ShopGrid products={products} />
      </div>
    </section>
  );
}
