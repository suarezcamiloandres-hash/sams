import { NextRequest, NextResponse } from "next/server";

import {
  createCheckoutUrl,
  isShopifyConfigured,
  PRODUCTS,
} from "@/lib/shopify";

/**
 * GET /api/checkout?flavor=huila
 *
 * Creates a Shopify cart for the product and redirects to checkout.
 * Falls back to the current site while Shopify is not configured.
 */
export async function GET(request: NextRequest) {
  const flavor = request.nextUrl.searchParams.get("flavor") ?? "huila";
  const product = PRODUCTS[flavor] ?? PRODUCTS.huila;

  if (!isShopifyConfigured) {
    return NextResponse.redirect(product.fallbackUrl);
  }

  try {
    const checkoutUrl = await createCheckoutUrl(product.handle);
    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    console.error("Checkout failed:", error);
    return NextResponse.redirect(product.fallbackUrl);
  }
}
