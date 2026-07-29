/**
 * Thin promo marquee across the very top of the site. The message is
 * marketing only — actual free shipping must be set in Shopify → Shipping
 * and delivery. The track is rendered twice so the -50% loop is seamless.
 */
const MESSAGES = [
  "Free postage for all orders",
  "Specialty Colombian coffee",
  "Roasted in Brisbane",
];

function Track() {
  return (
    <div className="flex shrink-0 items-center">
      {MESSAGES.map((msg) => (
        <span key={msg} className="flex items-center">
          <span className="mx-6 text-xs font-semibold uppercase tracking-[0.22em] text-espresso md:text-sm">
            {msg}
          </span>
          <span aria-hidden className="text-espresso/50">
            &#9670;
          </span>
        </span>
      ))}
    </div>
  );
}

export default function AnnouncementBar() {
  return (
    <div className="w-full overflow-hidden bg-gold py-2.5">
      <div className="flex w-max animate-marquee will-change-transform motion-reduce:animate-none">
        <Track />
        <Track />
      </div>
    </div>
  );
}
