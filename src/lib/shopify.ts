/**
 * Shopify Storefront API client.
 *
 * When NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and
 * NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN are not set, the site falls
 * back to static product data so the experience keeps working before the
 * Shopify store exists.
 */

const SHOPIFY_API_VERSION = "2025-01";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const isShopifyConfigured = Boolean(domain && storefrontToken);

export type CoffeeProduct = {
  handle: string;
  title: string;
  price: string;
  currencyCode: string;
  /** Where "Buy now" goes when Shopify is not configured yet. */
  fallbackUrl: string;
};

/**
 * The four Sam's Coffee products. `handle` must match the product handle
 * created in the Shopify admin.
 */
export const PRODUCTS: Record<string, CoffeeProduct> = {
  huila: {
    handle: "huila-origin-coffee",
    title: "Huila Origin Coffee",
    price: "19.00",
    currencyCode: "AUD",
    fallbackUrl: "https://samscoffee.com.au/#products",
  },
  geisha: {
    handle: "geisha-coffee",
    title: "Geisha Coffee",
    price: "15.00",
    currencyCode: "AUD",
    fallbackUrl: "https://samscoffee.com.au/#products",
  },
  caturra: {
    handle: "caturra-premium",
    title: "Caturra Premium",
    price: "18.00",
    currencyCode: "AUD",
    fallbackUrl: "https://samscoffee.com.au/#products",
  },
  reserve: {
    handle: "special-reserve",
    title: "Special Reserve",
    price: "15.00",
    currencyCode: "AUD",
    fallbackUrl: "https://samscoffee.com.au/#products",
  },
};

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

const FIRST_VARIANT_QUERY = /* GraphQL */ `
  query FirstVariant($handle: String!) {
    product(handle: $handle) {
      variants(first: 1) {
        nodes {
          id
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        checkoutUrl
      }
      userErrors {
        message
      }
    }
  }
`;

/** A product as shown in the carousel: live image + price from Shopify. */
export type LiveProduct = {
  /** Flavor key (huila / geisha / caturra / reserve). */
  flavor: string;
  title: string;
  /** Formatted price, e.g. "$19.00". */
  price: string;
  /** Featured image URL from Shopify, or null if none uploaded yet. */
  imageUrl: string | null;
  imageAlt: string;
  available: boolean;
};

function formatMoney(amount: string, currencyCode: string): string {
  const value = Number(amount);
  const symbol = currencyCode === "AUD" || currencyCode === "USD" ? "$" : "";
  const formatted = Number.isFinite(value) ? value.toFixed(2) : amount;
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currencyCode}`;
}

type ShopifyProductNode = {
  title: string;
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
} | null;

/**
 * Fetches title, featured image, price, and availability for all four
 * products in a single Storefront request (one aliased field per handle).
 * Returns the local `PRODUCTS` data as a fallback when Shopify is not
 * configured or a product/image is missing, so the carousel never breaks.
 */
export async function getProducts(): Promise<LiveProduct[]> {
  const entries = Object.entries(PRODUCTS);

  const fallback: LiveProduct[] = entries.map(([flavor, p]) => ({
    flavor,
    title: p.title,
    price: formatMoney(p.price, p.currencyCode),
    imageUrl: null,
    imageAlt: p.title,
    available: true,
  }));

  if (!isShopifyConfigured) {
    return fallback;
  }

  const query = /* GraphQL */ `
    query CarouselProducts {
      ${entries
        .map(
          ([flavor, p]) => `
        ${flavor}: product(handle: "${p.handle}") {
          title
          availableForSale
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
        }`,
        )
        .join("\n")}
    }
  `;

  try {
    const data = await shopifyFetch<Record<string, ShopifyProductNode>>(query);
    return entries.map(([flavor, p], i) => {
      const node = data[flavor];
      if (!node) return fallback[i];
      return {
        flavor,
        title: node.title || p.title,
        price: formatMoney(
          node.priceRange.minVariantPrice.amount,
          node.priceRange.minVariantPrice.currencyCode,
        ),
        imageUrl: node.featuredImage?.url ?? null,
        imageAlt: node.featuredImage?.altText || node.title || p.title,
        available: node.availableForSale,
      };
    });
  } catch (error) {
    console.error("getProducts failed, using fallback:", error);
    return fallback;
  }
}

/**
 * Creates a Shopify cart with one product and returns its checkout URL.
 */
export async function createCheckoutUrl(
  handle: string,
  quantity = 1,
): Promise<string> {
  const productData = await shopifyFetch<{
    product: { variants: { nodes: { id: string }[] } } | null;
  }>(FIRST_VARIANT_QUERY, { handle });

  const variantId = productData.product?.variants.nodes[0]?.id;
  if (!variantId) {
    throw new Error(`No variant found for product "${handle}"`);
  }

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
