import { Metadata } from "next";

import { SliceZone } from "@prismicio/react";
import * as prismic from "@prismicio/client";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { fallbackSlices } from "@/lib/fallbackSlices";

// This component renders your homepage.
//
// Use Next's generateMetadata function to render page metadata.
//
// Use the SliceZone to render the content of the page.

const FALLBACK_METADATA: Metadata = {
  title: "Sam's Coffee — Single Origin Coffee, for the world",
  description:
    "Specialty Colombian coffee grown at 1,600–2,000 m in Huila. SCA 84+, roasted in Brisbane, shipped worldwide.",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const client = createClient();
    const home = await client.getByUID("page", "home");

    return {
      title: prismic.asText(home.data.title),
      description: home.data.meta_description,
      openGraph: {
        title: home.data.meta_title ?? undefined,
        images: [{ url: home.data.meta_image.url ?? "" }],
      },
    };
  } catch {
    return FALLBACK_METADATA;
  }
}

export default async function Index() {
  // The client queries content from the Prismic API. Until the Prismic
  // repository exists, we render the local fallback content instead.
  let slices = fallbackSlices;

  try {
    const client = createClient();
    const home = await client.getByUID("page", "home");
    slices = home.data.slices;
  } catch {
    // Prismic repo not available yet — fallback content keeps the site alive.
  }

  return <SliceZone slices={slices} components={components} />;
}
