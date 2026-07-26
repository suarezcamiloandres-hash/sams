import { NextResponse } from "next/server";

import { getProducts } from "@/lib/shopify";

/**
 * GET /api/products
 *
 * Returns the four coffees with their live Shopify image, price, and
 * availability. Falls back to local product data when Shopify is not
 * configured. Cached for 60s so the carousel stays fast.
 */
export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}
