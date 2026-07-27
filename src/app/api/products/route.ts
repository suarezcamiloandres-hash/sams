import { NextRequest, NextResponse } from "next/server";

import { getDiagnostics, getProducts } from "@/lib/shopify";

/**
 * GET /api/products         → carousel product data (image, price, variant)
 * GET /api/products?debug=1 → connection diagnostics (no token exposed)
 *
 * Falls back to local data when Shopify is not configured. Cached 60s.
 */
export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("debug") === "1") {
    return NextResponse.json(await getDiagnostics(), {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const products = await getProducts();
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}
