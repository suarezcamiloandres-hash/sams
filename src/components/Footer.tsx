import React from "react";
import { SamsLogo } from "./SamsLogo";
import CircleText from "./CircleText";

type Props = {};

export default function Footer({}: Props) {
  return (
    <footer className="bg-espresso text-gold">
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-6 px-4 py-10">
        <SamsLogo onDark className="h-28" />
        <div className="absolute right-24 top-0 size-28 origin-center -translate-y-14 md:size-48 md:-translate-y-28">
          <CircleText />
        </div>
        <div className="text-center text-sm text-crema/70">
          <p>+61 400 765 488 · orders@samscoffee.com.au</p>
          <p>Brisbane, Queensland, Australia · Mon–Fri 8:00 AM–5:00 PM (AEST)</p>
        </div>
      </div>
    </footer>
  );
}
