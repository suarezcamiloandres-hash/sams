"use client";

import { Content } from "@prismicio/client";
import { PrismicText, SliceComponentProps } from "@prismicio/react";
import { Center, Environment, View } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Group } from "three";
import gsap from "gsap";

import FloatingCan from "@/components/FloatingCan";
import { SodaCanProps } from "@/components/SodaCan";
import { useCart } from "@/lib/cart-context";
import { ArrowIcon } from "./ArrowIcon";
import { WavyCircles } from "./WavyCircles";

const SPINS_ON_CHANGE = 8;

/** Background color cycled per product (independent of the product itself). */
const PALETTE = ["#6B4423", "#8A4455", "#4E5A33", "#5C2E24", "#3A2A17"];

/** One product in the carousel — comes from /api/products (Shopify). */
type ProductCard = {
  id: string;
  title: string;
  description: string;
  price: string;
  amount: number;
  currencyCode: string;
  imageUrl: string | null;
  imageAlt: string;
  available: boolean;
  variantId: string | null;
  beanFlavor: SodaCanProps["flavor"];
};

/** Shown until /api/products responds (also the shape when Shopify is off). */
const FALLBACK_DESC = "Specialty Colombian coffee, roasted to order in Brisbane.";
const FALLBACK: ProductCard[] = [
  { id: "huila", title: "Huila Origin Coffee", description: FALLBACK_DESC, price: "$19.00", amount: 19, currencyCode: "AUD", imageUrl: null, imageAlt: "Huila Origin Coffee", available: true, variantId: null, beanFlavor: "huila" },
  { id: "geisha", title: "Geisha Coffee", description: FALLBACK_DESC, price: "$15.00", amount: 15, currencyCode: "AUD", imageUrl: null, imageAlt: "Geisha Coffee", available: true, variantId: null, beanFlavor: "geisha" },
  { id: "caturra", title: "Caturra Premium", description: FALLBACK_DESC, price: "$18.00", amount: 18, currencyCode: "AUD", imageUrl: null, imageAlt: "Caturra Premium", available: true, variantId: null, beanFlavor: "caturra" },
  { id: "reserve", title: "Special Reserve", description: FALLBACK_DESC, price: "$15.00", amount: 15, currencyCode: "AUD", imageUrl: null, imageAlt: "Special Reserve", available: true, variantId: null, beanFlavor: "reserve" },
];

/**
 * Props for `Carousel`.
 */
export type CarouselProps = SliceComponentProps<Content.CarouselSlice>;

/**
 * Component for "Carousel" Slices.
 */
const Carousel = ({ slice }: CarouselProps): JSX.Element => {
  const [index, setIndex] = useState(0);
  const [products, setProducts] = useState<ProductCard[]>(FALLBACK);
  const sodaCanRef = useRef<Group>(null);
  const { addItem } = useCart();

  // Load whatever products exist in Shopify (image, price, variant).
  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setProducts(data as ProductCard[]);
          setIndex(0);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const count = products.length;
  const current = products[index];
  const displayName = current.title;
  const displayPrice = current.price;
  const displayImage = current.imageUrl;
  const checkoutHref = current.variantId
    ? `/api/checkout?variant=${encodeURIComponent(current.variantId)}`
    : "/api/checkout";

  function changeFlavor(next: number) {
    const nextIndex = (next + count) % count;

    const tl = gsap.timeline();

    // Spin the 3D bean only when it's the one on screen (no photo yet).
    if (sodaCanRef.current) {
      tl.to(
        sodaCanRef.current.rotation,
        {
          y:
            next > index
              ? `-=${Math.PI * 2 * SPINS_ON_CHANGE}`
              : `+=${Math.PI * 2 * SPINS_ON_CHANGE}`,
          ease: "power2.inOut",
          duration: 1,
        },
        0,
      );
    }

    tl.to(
        ".background, .wavy-circles-outer, .wavy-circles-inner",
        {
          backgroundColor: PALETTE[nextIndex % PALETTE.length],
          fill: PALETTE[nextIndex % PALETTE.length],
          ease: "power2.inOut",
          duration: 1,
        },
        0,
      )
      .to(".text-wrapper", { duration: 0.2, y: -10, opacity: 0 }, 0)
      .to({}, { onStart: () => setIndex(nextIndex) }, 0.5)
      .to(".text-wrapper", { duration: 0.2, y: 0, opacity: 1 }, 0.7);
  }

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="carousel relative grid h-screen grid-rows-[auto,1fr,auto] justify-center gap-y-4 overflow-hidden bg-white py-10 text-white"
    >
      <div className="background pointer-events-none absolute inset-0 bg-[#6B4423] opacity-50" />

      <WavyCircles className="absolute left-1/2 top-1/2 h-[120vmin] -translate-x-1/2 -translate-y-1/2 text-[#6B4423]" />

      <h2 className="relative text-center text-5xl font-bold">
        <PrismicText field={slice.primary.heading} />
      </h2>

      <div className="grid grid-cols-[auto,auto,auto] items-center">
        {/* Left */}
        <ArrowButton
          onClick={() => changeFlavor(index + 1)}
          direction="left"
          label="Previous product"
        />
        {/* Product photo (from Shopify) with the 3D bean as fallback */}
        <div className="relative aspect-square h-[70vmin] max-h-[42vh] min-h-40 md:max-h-[46vh]">
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={displayImage}
              src={displayImage}
              alt={current?.imageAlt ?? displayName}
              className="h-full w-full object-contain drop-shadow-2xl"
            />
          ) : (
            <View className="h-full w-full">
              <Center position={[0, 0, 1.5]}>
                <FloatingCan
                  ref={sodaCanRef}
                  floatIntensity={0.3}
                  rotationIntensity={1}
                  flavor={current.beanFlavor}
                />
              </Center>

              <Environment
                files="/hdr/lobby.hdr"
                environmentIntensity={0.6}
                environmentRotation={[0, 3, 0]}
              />
              <directionalLight intensity={6} position={[0, 1, 1]} />
            </View>
          )}
        </div>
        {/* Right */}
        <ArrowButton
          onClick={() => changeFlavor(index - 1)}
          direction="right"
          label="Next product"
        />
      </div>

      <div className="text-area relative mx-auto px-6 pb-2 text-center">
        <div className="text-wrapper">
          <p className="mx-auto max-w-2xl text-balance text-xl font-semibold leading-tight md:text-2xl">
            {displayName}
          </p>
          <p className="mt-1 text-2xl font-bold text-gold md:text-3xl">
            {displayPrice}
          </p>
        </div>
        <p className="mx-auto mt-2 line-clamp-2 max-w-xl text-pretty text-sm font-normal opacity-90 md:text-base">
          {current.description}
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                current.variantId &&
                addItem({
                  variantId: current.variantId,
                  handle: current.id,
                  title: current.title,
                  imageUrl: current.imageUrl,
                  amount: current.amount,
                  currencyCode: current.currencyCode,
                })
              }
              disabled={!current.variantId}
              className="rounded-sm border-2 border-white px-6 py-3 text-base font-bold uppercase tracking-wide text-white transition-colors duration-150 hover:bg-white hover:text-espresso disabled:opacity-40 md:text-lg"
            >
              Add to cart
            </button>
            <a
              href={checkoutHref}
              className="rounded-sm bg-gold px-6 py-3 text-base font-bold uppercase tracking-wide text-espresso transition-colors duration-150 hover:bg-gold-deep md:text-lg"
            >
              Buy now — {displayPrice}
            </a>
          </div>
          <a
            href={`/products/${current.id}`}
            className="text-sm font-medium uppercase tracking-wide text-white/80 underline underline-offset-4 transition-colors hover:text-white"
          >
            View details
          </a>
        </div>
      </div>
    </section>
  );
};

export default Carousel;

type ArrowButtonProps = {
  direction?: "right" | "left";
  label: string;
  onClick: () => void;
};

function ArrowButton({
  label,
  onClick,
  direction = "right",
}: ArrowButtonProps) {
  return (
    <button
      onClick={onClick}
      className="size-12 rounded-full border-2 border-white bg-white/10 p-3 opacity-85 ring-white focus:outline-none focus-visible:opacity-100 focus-visible:ring-4 md:size-16 lg:size-20"
    >
      <ArrowIcon className={clsx(direction === "right" && "-scale-x-100")} />
      <span className="sr-only">{label}</span>
    </button>
  );
}
