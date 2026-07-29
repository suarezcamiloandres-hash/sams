/**
 * Thin promo bar across the very top of the site. The message is marketing
 * only — actual free shipping must be set in Shopify → Shipping and delivery.
 */
export default function AnnouncementBar() {
  return (
    <div className="w-full bg-espresso px-4 py-2.5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold md:text-sm">
        Free postage for all orders
      </p>
    </div>
  );
}
