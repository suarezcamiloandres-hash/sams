import { NextRequest, NextResponse } from "next/server";

import {
  createCheckout,
  createCheckoutUrl,
  isShopifyConfigured,
  FALLBACK_STORE_URL,
} from "@/lib/shopify";

/**
 * GET /api/checkout?variant=<variantGID>&qty=<n>
 *
 * Single-item "Buy now": creates a cart and redirects to checkout.
 * Falls back to the store when Shopify is unconfigured or the variant is
 * missing.
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

/**
 * POST /api/checkout  { lines: [{ variantId, quantity }] }
 *
 * Whole-cart checkout: creates a multi-line cart and returns { url }.
 */
export async function POST(request: NextRequest) {
  if (!isShopifyConfigured) {
    return NextResponse.json({ url: FALLBACK_STORE_URL });
  }

  try {
    const body = (await request.json()) as {
      lines?: { variantId?: string; quantity?: number }[];
    };
    const lines = (body.lines ?? [])
      .filter((l): l is { variantId: string; quantity: number } =>
        Boolean(l.variantId),
      )
      .map((l) => ({ variantId: l.variantId, quantity: Number(l.quantity) || 1 }));

    if (lines.length === 0) {
      return NextResponse.json({ url: FALLBACK_STORE_URL });
    }

    const url = await createCheckout(lines);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Cart checkout failed:", error);
    return NextResponse.json({ url: FALLBACK_STORE_URL }, { status: 200 });
  }
}
