import type { InquiryKind } from "@/lib/types";

export const SITE = {
  name: "VisionaryHaus",
  owner: "Danielle Nicole Hough",
  tagline: "Photography for businesses that need real content, and for families who want real pictures.",
  region: "Fort Wayne & Northeast Indiana · travels statewide",
  email: "hello@visionaryhaus.co",
  instagram: "https://www.instagram.com/",
};

export type Offer = {
  slug: string;
  name: string;
  tag?: string;
  price: string;
  summary: string;
  includes: string[];
  terms?: string[];
  audience?: string;
  kind: InquiryKind;
};

export const RETAINERS: Offer[] = [
  {
    slug: "quarterly",
    name: "Quarterly Content Retainer",
    tag: "The core offer",
    price: "One flat rate, every quarter",
    kind: "retainer",
    summary:
      "One capture day every quarter, edited and delivered into an organized library your team can pull from all season.",
    includes: [
      "One full capture day per quarter",
      "You choose the target each quarter: facility, event, headshots, product, or process",
      "Culled, edited, captioned, and dropped into a shared folder, ready to post",
      "Annual company headshot day folded in",
      "Same price every quarter, so it lives as a budget line instead of a project",
    ],
    terms: [
      "Use it or lose it within the quarter",
      "Two weeks notice on event dates; anything inside two weeks is rush and billed separately",
    ],
    audience:
      "Built for manufacturing and industrial, healthcare groups, multi-location franchises, and developers. Recruiting content is the usual starting point, because that budget sits in HR.",
  },
  {
    slug: "monthly",
    name: "Monthly Content Retainer",
    tag: "Higher frequency",
    price: "Per location, per month",
    kind: "retainer",
    summary:
      "For businesses with a real content cycle. Restaurants and hospitality groups are the obvious fit, but so is any brand that posts every week.",
    includes: [
      "One session per month, plus the edit",
      "A capped image count so every gallery stays sharp",
      "Multi-location groups priced per location, per month",
      "Captioned and delivered to a shared folder, ready to post",
    ],
    terms: ["Delivered ready to post. Managed posting is not included, so your calendar and comments stay yours."],
  },
];

export const ADD_ONS = [
  {
    name: "Drone",
    body: "Facility aerials once a year, or monthly progress documentation for construction and development sites where the change is the story.",
  },
  {
    name: "Vertical video clips",
    body: "Short vertical clips pulled from the same session, cut for Reels, TikTok, and Shorts.",
  },
  {
    name: "Extra capture days",
    body: "Additional days at the preferred retainer rate when a launch, opening, or event needs more coverage.",
  },
];

export const ONE_OFFS: Offer[] = [
  {
    slug: "headshots",
    name: "Company headshot days",
    price: "Priced per day, not per person",
    kind: "headshots",
    summary:
      "Consistent, on-brand headshots for the whole team in a single visit. It is also the cheapest way to find out what working together is like before committing to a retainer.",
    includes: ["Portable setup at your location", "Every person edited to the same look", "Delivered in web and print sizes"],
  },
  {
    slug: "product",
    name: "Product, menu & facility shoots",
    price: "Quoted per shoot",
    kind: "product",
    summary: "Menus, product lines, showrooms, and facilities photographed cleanly enough to sell from and consistently enough to reuse.",
    includes: ["Shot list built with you ahead of time", "Edited to match your existing brand assets", "Fast turnaround for launches"],
  },
  {
    slug: "events",
    name: "Event coverage",
    price: "Hourly or by the event",
    kind: "event",
    summary: "Fundraisers, openings, race days, and company events covered from setup to the last speech.",
    includes: ["Candid and posed coverage", "Same-week highlight delivery", "Full gallery ready for sponsors and press"],
  },
];

export const MINI_SESSIONS = {
  name: "Mini sessions",
  price: "$50 – $75",
  duration: "15 minutes",
  summary:
    "Quick, low-pressure sessions for families and individuals, announced a few times a year. The base package stands on its own: no watermarks, no downgrades.",
  includes: ["Three printed photos", "A small set of edited digitals", "Locations announced per date"],
  upsell: "Love the whole gallery? Add it after you have seen the images, for $75 – $150.",
  kind: "mini_session" as InquiryKind,
};

export const PROCESS = [
  { step: "01", title: "Tell me what it points at", body: "A short call to pick the target for the quarter (or the date for the session) and what the images need to do." },
  { step: "02", title: "Capture day", body: "I show up ready, work the shot list, and stay flexible for what the day actually gives us." },
  { step: "03", title: "Edit & caption", body: "Culled, edited to a consistent look, and captioned so nobody on your team has to guess what they are looking at." },
  { step: "04", title: "Delivered to your folder", body: "Everything lands in an organized shared library, sized for web and print, ready to post." },
];
