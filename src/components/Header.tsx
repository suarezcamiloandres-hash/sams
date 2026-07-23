import React from "react";
import { SamsLogo } from "@/components/SamsLogo";

type Props = {};

export default function Header({}: Props) {
  return (
    <header className="-mb-28 flex justify-center py-4">
      <SamsLogo className="z-10 h-24 cursor-pointer" />
    </header>
  );
}
