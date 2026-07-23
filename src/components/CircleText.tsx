import clsx from "clsx";

type Props = {
  textColor?: string;
  backgroundColor?: string;
  className?: string;
};

export default function CircleText({
  textColor = "#C89B4A",
  backgroundColor = "#1D1207",
  className,
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 123 123"
      className={clsx("circle-text", className)}
      aria-labelledby="circle-text"
    >
      <title id="circle-text">Single Origin Coffee. From Huila, Colombia.</title>
      <path
        fill={backgroundColor}
        d="M122 61.5a61 61 0 11-122 0 61 61 0 01122 0z"
      ></path>
      <g className="animate-spin-slow origin-center">
        <defs>
          <path
            id="circle-text-path"
            d="M61.5 16.5 a45 45 0 1 1 -0.01 0"
          ></path>
        </defs>
        <text
          fill={textColor}
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
          }}
        >
          <textPath href="#circle-text-path" startOffset="0">
            SINGLE ORIGIN · HUILA, COLOMBIA
          </textPath>
        </text>
      </g>
    </svg>
  );
}
