import Image from "next/image";

/**
 * Trust strip of the certifications Sam's Coffee holds. Each badge sits on
 * a card; on hover it lifts, turns from muted to full color, and its name
 * reveals. Names stay visible on touch devices (no hover).
 */
const CERTIFICATIONS = [
  { src: "/certifications/1.png", name: "Café de Colombia" },
  { src: "/certifications/2.png", name: "Fairtrade" },
  { src: "/certifications/3.png", name: "USDA Organic" },
  { src: "/certifications/4.png", name: "ICA Certified" },
  { src: "/certifications/5.png", name: "Protected Geographic Indication" },
  { src: "/certifications/6.png", name: "EU Organic" },
  { src: "/certifications/7.png", name: "Rainforest Alliance" },
  { src: "/certifications/8.png", name: "Specialty Coffee Association" },
];

export default function Certifications() {
  return (
    <section className="bg-crema-2 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-deep">
          International Certifications
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-balance text-2xl font-bold text-espresso md:text-3xl">
          Our coffee meets the world&apos;s most demanding quality standards
        </h2>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-14 md:gap-6 lg:grid-cols-8">
          {CERTIFICATIONS.map((cert) => (
            <li
              key={cert.src}
              className="group flex flex-col items-center gap-3 rounded-xl border border-espresso/10 bg-white/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-white hover:shadow-lg"
            >
              <div className="flex h-16 w-full items-center justify-center">
                <Image
                  src={cert.src}
                  alt={cert.name}
                  width={120}
                  height={120}
                  className="max-h-16 w-auto object-contain opacity-70 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
              <span className="text-balance text-[0.7rem] font-medium leading-tight text-espresso/60 transition-colors duration-300 group-hover:text-espresso">
                {cert.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
