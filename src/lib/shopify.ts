/**
 * Shopify Storefront API client.
 *
 * The carousel loads whatever products exist in the store — no hardcoded
 * handles — so adding or removing products in Shopify updates the site
 * automatically. When the store isn't configured (no env vars), a small
 * static fallback keeps the site rendering with the 3D bean.
 */

import { formatMoney } from "./money";

const SHOPIFY_API_VERSION = "2025-01";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
// Server-only secret (NOT NEXT_PUBLIC) — used to save newsletter subscribers.
const adminToken = process.env.SHOPIFY_ADMIN_API_TOKEN;

export const isShopifyConfigured = Boolean(domain && storefrontToken);
export const isAdminConfigured = Boolean(domain && adminToken);

/** Where "Buy now" goes when Shopify isn't configured yet. */
const FALLBACK_STORE_URL = "https://samscoffee.com.au/#products";

const BEAN_FLAVORS = ["huila", "geisha", "caturra", "reserve"] as const;
export type BeanFlavor = (typeof BEAN_FLAVORS)[number];

/** A product as shown in the carousel. */
export type LiveProduct = {
  /** Product handle (stable id). */
  id: string;
  title: string;
  /** Plain-text product description from Shopify. */
  description: string;
  /** Formatted price, e.g. "$19.00". */
  price: string;
  /** Numeric unit price (for cart subtotal math). */
  amount: number;
  currencyCode: string;
  /** Featured image URL from Shopify, or null if none uploaded yet. */
  imageUrl: string | null;
  imageAlt: string;
  available: boolean;
  /** First variant's GID, used to build the checkout. Null in fallback. */
  variantId: string | null;
  /** 3D bean shown when there is no product photo (dev / fallback). */
  beanFlavor: BeanFlavor;
};

/** Static products used only when Shopify is unreachable/unconfigured. */
const FALLBACK_DESC = "Specialty Colombian coffee, roasted to order in Brisbane.";
const FALLBACK_PRODUCTS: LiveProduct[] = [
  { id: "huila", title: "Huila Origin Coffee", description: FALLBACK_DESC, price: "$19.00", amount: 19, currencyCode: "AUD", imageUrl: null, imageAlt: "Huila Origin Coffee", available: true, variantId: null, beanFlavor: "huila" },
  { id: "geisha", title: "Geisha Coffee", description: FALLBACK_DESC, price: "$15.00", amount: 15, currencyCode: "AUD", imageUrl: null, imageAlt: "Geisha Coffee", available: true, variantId: null, beanFlavor: "geisha" },
  { id: "caturra", title: "Caturra Premium", description: FALLBACK_DESC, price: "$18.00", amount: 18, currencyCode: "AUD", imageUrl: null, imageAlt: "Caturra Premium", available: true, variantId: null, beanFlavor: "caturra" },
  { id: "reserve", title: "Special Reserve", description: FALLBACK_DESC, price: "$15.00", amount: 15, currencyCode: "AUD", imageUrl: null, imageAlt: "Special Reserve", available: true, variantId: null, beanFlavor: "reserve" },
];


async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!isShopifyConfigured) {
    throw new Error("Shopify is not configured");
  }

  const res = await fetch(
    `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontToken as string,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Shopify request failed: ${res.status}`);
  }

  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

const PRODUCTS_QUERY = /* GraphQL */ `
  query CarouselProducts {
    products(first: 12, sortKey: TITLE) {
      nodes {
        handle
        title
        description
        availableForSale
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 1) { nodes { id } }
      }
    }
  }
`;

type ProductsResponse = {
  products: {
    nodes: {
      handle: string;
      title: string;
      description: string;
      availableForSale: boolean;
      featuredImage: { url: string; altText: string | null } | null;
      priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
      variants: { nodes: { id: string }[] };
    }[];
  };
};

/**
 * Fetches all store products (up to 12) with image, price, availability, and
 * first-variant id. Falls back to static data when Shopify is unconfigured,
 * returns no products, or errors — so the carousel never breaks.
 */
export async function getProducts(): Promise<LiveProduct[]> {
  if (!isShopifyConfigured) return FALLBACK_PRODUCTS;

  try {
    const data = await shopifyFetch<ProductsResponse>(PRODUCTS_QUERY);
    const nodes = data.products?.nodes ?? [];
    if (nodes.length === 0) return FALLBACK_PRODUCTS;

    return nodes.map((node, i) => ({
      id: node.handle,
      title: node.title,
      description: node.description || FALLBACK_DESC,
      price: formatMoney(
        node.priceRange.minVariantPrice.amount,
        node.priceRange.minVariantPrice.currencyCode,
      ),
      amount: Number(node.priceRange.minVariantPrice.amount),
      currencyCode: node.priceRange.minVariantPrice.currencyCode,
      imageUrl: node.featuredImage?.url ?? null,
      imageAlt: node.featuredImage?.altText || node.title,
      // The store doesn't track inventory, so everything is purchasable.
      // Shopify checkout stays the final authority on availability.
      available: true,
      variantId: node.variants.nodes[0]?.id ?? null,
      beanFlavor: BEAN_FLAVORS[i % BEAN_FLAVORS.length],
    }));
  } catch (error) {
    console.error("getProducts failed, using fallback:", error);
    return FALLBACK_PRODUCTS;
  }
}

/** Full data for a single product detail page. */
export type ProductDetail = {
  handle: string;
  title: string;
  descriptionHtml: string;
  price: string;
  amount: number;
  currencyCode: string;
  imageUrl: string | null;
  imageAlt: string;
  images: { url: string; alt: string }[];
  available: boolean;
  variantId: string | null;
};

const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      handle
      title
      descriptionHtml
      availableForSale
      featuredImage { url altText }
      images(first: 6) { nodes { url altText } }
      priceRange { minVariantPrice { amount currencyCode } }
      variants(first: 1) { nodes { id } }
    }
  }
`;

/**
 * Fetches one product by handle for its detail page. Falls back to the
 * static product with the same id when Shopify is unconfigured; returns
 * null (→ 404) when the product doesn't exist.
 */
export async function getProduct(handle: string): Promise<ProductDetail | null> {
  if (!isShopifyConfigured) {
    const fb = FALLBACK_PRODUCTS.find((p) => p.id === handle);
    if (!fb) return null;
    return {
      handle: fb.id,
      title: fb.title,
      descriptionHtml: `<p>${fb.description}</p>`,
      price: fb.price,
      amount: fb.amount,
      currencyCode: fb.currencyCode,
      imageUrl: fb.imageUrl,
      imageAlt: fb.imageAlt,
      images: [],
      available: fb.available,
      variantId: fb.variantId,
    };
  }

  try {
    const data = await shopifyFetch<{
      product: {
        handle: string;
        title: string;
        descriptionHtml: string;
        availableForSale: boolean;
        featuredImage: { url: string; altText: string | null } | null;
        images: { nodes: { url: string; altText: string | null }[] };
        priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
        variants: { nodes: { id: string }[] };
      } | null;
    }>(PRODUCT_QUERY, { handle });

    const p = data.product;
    if (!p) return null;
    return {
      handle: p.handle,
      title: p.title,
      descriptionHtml: p.descriptionHtml || "",
      price: formatMoney(
        p.priceRange.minVariantPrice.amount,
        p.priceRange.minVariantPrice.currencyCode,
      ),
      amount: Number(p.priceRange.minVariantPrice.amount),
      currencyCode: p.priceRange.minVariantPrice.currencyCode,
      imageUrl: p.featuredImage?.url ?? null,
      imageAlt: p.featuredImage?.altText || p.title,
      images: p.images.nodes.map((n) => ({ url: n.url, alt: n.altText || p.title })),
      // Store doesn't track inventory — treat as always purchasable.
      available: true,
      variantId: p.variants.nodes[0]?.id ?? null,
    };
  } catch (error) {
    console.error("getProduct failed:", error);
    return null;
  }
}

/**
 * Diagnostics for /api/products?debug=1 — never exposes the token, only
 * whether things are wired up. Safe to remove once launched.
 */
export async function getDiagnostics() {
  const out = {
    configured: isShopifyConfigured,
    hasDomain: Boolean(domain),
    hasToken: Boolean(storefrontToken),
    productCount: 0,
    error: null as string | null,
  };
  if (!isShopifyConfigured) return out;
  try {
    const data = await shopifyFetch<ProductsResponse>(PRODUCTS_QUERY);
    out.productCount = data.products?.nodes?.length ?? 0;
  } catch (error) {
    out.error = error instanceof Error ? error.message : String(error);
  }
  return out;
}

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { checkoutUrl }
      userErrors { message }
    }
  }
`;

/**
 * Creates a Shopify cart with one variant and returns its checkout URL.
 */
export async function createCheckoutUrl(
  variantId: string,
  quantity = 1,
): Promise<string> {
  const cartData = await shopifyFetch<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(CART_CREATE_MUTATION, {
    lines: [{ merchandiseId: variantId, quantity }],
  });

  const checkoutUrl = cartData.cartCreate.cart?.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error(
      cartData.cartCreate.userErrors.map((e) => e.message).join("; ") ||
        "Cart creation failed",
    );
  }
  return checkoutUrl;
}

/**
 * Creates a Shopify cart with multiple line items (the whole cart) and
 * returns its checkout URL.
 */
export async function createCheckout(
  lines: { variantId: string; quantity: number }[],
): Promise<string> {
  const cartData = await shopifyFetch<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(CART_CREATE_MUTATION, {
    lines: lines.map((l) => ({
      merchandiseId: l.variantId,
      quantity: Math.min(99, Math.max(1, l.quantity)),
    })),
  });

  const checkoutUrl = cartData.cartCreate.cart?.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error(
      cartData.cartCreate.userErrors.map((e) => e.message).join("; ") ||
        "Cart creation failed",
    );
  }
  return checkoutUrl;
}

/**
 * Subscribes an email to marketing in Shopify via the Admin API. Degrades
 * gracefully: when the admin token isn't set the popup still works, it just
 * doesn't persist the email yet (saved: false). Treats "already subscribed"
 * as success.
 */
export async function subscribeEmail(
  email: string,
): Promise<{ ok: boolean; saved: boolean }> {
  if (!isAdminConfigured) return { ok: true, saved: false };

  const query = /* GraphQL */ `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer { id }
        userErrors { field message }
      }
    }
  `;

  try {
    const res = await fetch(
      `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken as string,
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              email,
              emailMarketingConsent: {
                marketingState: "SUBSCRIBED",
                marketingOptInLevel: "SINGLE_OPT_IN",
              },
            },
          },
        }),
        cache: "no-store",
      },
    );

    if (!res.ok) return { ok: true, saved: false };
    const json = (await res.json()) as {
      data?: {
        customerCreate?: {
          customer?: { id: string } | null;
          userErrors?: { message: string }[];
        };
      };
    };
    const errors = json.data?.customerCreate?.userErrors ?? [];
    const alreadyExists = errors.some((e) => /already|taken/i.test(e.message));
    const saved =
      Boolean(json.data?.customerCreate?.customer?.id) || alreadyExists;
    return { ok: true, saved };
  } catch (error) {
    console.error("subscribeEmail failed:", error);
    return { ok: true, saved: false };
  }
}

export { FALLBACK_STORE_URL };
