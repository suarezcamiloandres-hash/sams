import { NextRequest, NextResponse } from "next/server";

import { subscribeEmail } from "@/lib/shopify";

/**
 * POST /api/subscribe  { email }
 *
 * Subscribes the email to marketing in Shopify. Always returns ok:true so
 * the popup can reveal the discount code even before the admin token is set.
 */
export async function POST(request: NextRequest) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const result = await subscribeEmail(email);
  return NextResponse.json(result);
}
