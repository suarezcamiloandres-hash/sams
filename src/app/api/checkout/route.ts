import { NextRequest, NextResponse } from "next/server";

import {
  createCheckoutUrl,
  isShopifyConfigured,
  FALLBACK_STORE_URL,
} from "@/lib/shopify";

/**
 * GET /api/checkout?variant=<variantGID>
 *
 * Creates a Shopify cart for the given variant and redirects to checkout.
 * Falls back to the current store while Shopify is not configured or the
 * variant is missing.
 */
export async function GET(request: NextRequest) {
  const variantId = request.nextUrl.searchParams.get("variant");
  const qtyParam = Number(request.nextUrl.searchParams.get("qty"));
  const quantity = Math.min(99, Math.max(1, Number.isFinite(qtyParam) ? qtyParam : 1));

  if (!isShopifyConfigured || !variantId) {
    return NextResponse.redirect(FALLBACK_STORE_URL);
  }

  try {
    const checkoutUrl = await createCheckoutUrl(variantId, quantity);
    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    console.error("Checkout failed:", error);
    return NextResponse.redirect(FALLBACK_STORE_URL);
  }
}
