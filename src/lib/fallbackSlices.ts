import { Content } from "@prismicio/client";

/**
 * Local fallback content used when the Prismic repository is not reachable
 * (e.g. before the client creates their Prismic account). Mirrors the
 * runtime shape the Prismic API returns so the SliceZone renders normally.
 */

const richHeading = (text: string, level: 1 | 2 = 1) => [
  { type: `heading${level}`, text, spans: [] },
];

const richParagraph = (text: string) => [{ type: "paragraph", text, spans: [] }];

export const fallbackSlices = [
  {
    id: "fallback$hero",
    slice_type: "hero",
    slice_label: null,
    variation: "default",
    version: "initial",
    items: [],
    primary: {
      heading: richHeading("Single Origin"),
      subheading: richParagraph("Coffee for the world."),
      body: richParagraph(
        "Specialty Colombian coffee grown between 1,600 and 2,000 metres in Huila. SCA score 84+, every harvest.",
      ),
      button_text: "Shop coffee",
      button_link: { link_type: "Web", url: "#choose-your-coffee" },
      cans_image: {},
      second_heading: richHeading("Crafted at origin", 2),
      second_body: richParagraph(
        "Born from the heart of the Colombian coffee tradition, Sam's Coffee works directly with farming families in Huila — where women lead much of the cultivation, harvest, and selection. Every bag is traceable to a real farm and a real harvest.",
      ),
    },
  },
  {
    id: "fallback$sky_dive",
    slice_type: "sky_dive",
    slice_label: null,
    variation: "default",
    version: "initial",
    items: [],
    primary: {
      sentence: "From Huila to the world",
      flavor: "huila",
    },
  },
  {
    id: "fallback$alternating_text",
    slice_type: "alternating_text",
    slice_label: null,
    variation: "default",
    version: "initial",
    items: [],
    primary: {
      text_group: [
        {
          heading: richHeading("Grown at altitude", 2),
          body: richParagraph(
            "Our lots grow between 1,600 and 2,000 metres above sea level in Huila, Colombia — slow-ripened by the mountain climate for deeper sweetness and cleaner acidity.",
          ),
        },
        {
          heading: richHeading("Led by women", 2),
          body: richParagraph(
            "Women lead much of the cultivation, harvest, and selection on the family farms we partner with. Buying Sam's Coffee supports their work directly — no intermediaries.",
          ),
        },
        {
          heading: richHeading("Traceable and sustainable", 2),
          body: richParagraph(
            "Every bag traces back to a real farm, a real altitude, and a real harvest date — grown with practices that care for the soil and water of the Colombian Andes.",
          ),
        },
      ],
    },
  },
  {
    id: "fallback$carousel",
    slice_type: "carousel",
    slice_label: null,
    variation: "default",
    version: "initial",
    items: [],
    primary: {
      heading: richHeading("Choose your coffee", 2),
      price_copy: richParagraph(
        "250 g whole beans · roasted to order in Brisbane · free shipping on subscriptions",
      ),
    },
  },
  {
    id: "fallback$big_text",
    slice_type: "big_text",
    slice_label: null,
    variation: "default",
    version: "initial",
    items: [],
    primary: {},
  },
] as unknown as Content.PageDocumentData["slices"];
