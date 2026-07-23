import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `BigText`.
 */
export type BigTextProps = SliceComponentProps<Content.BigTextSlice>;

/**
 * Component for "BigText" Slices.
 */
const BigText = ({ slice }: BigTextProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="min-h-screen w-screen overflow-hidden bg-espresso text-gold"
    >
      <h2 className="grid w-full justify-center gap-[3vw] py-10 text-center font-black uppercase leading-[.7]">
        <div className="text-[20vw]">Coffee</div>
        <div className="grid gap-[2vw] text-[18vw] md:flex md:justify-center md:text-[8vw]">
          <span className="inline-block">born </span>
          <span className="inline-block max-md:text-[16vw]">in </span>
          <span className="inline-block max-md:text-[18vw]">Huila, </span>
        </div>
        <div className="grid gap-[2vw] text-[16vw] md:flex md:justify-center md:text-[8vw]">
          <span className="inline-block">shared </span>
          <span className="inline-block max-md:text-[14vw]">with </span>
          <span className="inline-block max-md:text-[15vw]">the </span>
        </div>
        <div className="text-[22vw]">World</div>
      </h2>
    </section>
  );
};

export default BigText;
