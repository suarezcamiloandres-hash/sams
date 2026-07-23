import Image from "next/image";
import clsx from "clsx";

type Props = {
  className?: string;
  /**
   * The source PNG is white-on-transparent (made for dark backgrounds).
   * On light backgrounds we flip it to near-black with a brightness filter.
   */
  onDark?: boolean;
};

export function SamsLogo({ className, onDark = false }: Props) {
  return (
    <Image
      src="/logo-sams.png"
      alt="Sam's Coffee"
      width={842}
      height={451}
      priority
      className={clsx("w-auto", !onDark && "brightness-0", className)}
    />
  );
}
