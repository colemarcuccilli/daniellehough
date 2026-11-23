import type { InquiryKind } from "@/lib/types";

export const SITE = {
  name: "Dani Cams",
  owner: "Danielle Hough",
  tagline: "Wedding, engagement, and save-the-date photography across Indiana.",
  region: "Fort Wayne & Northeast Indiana · travels statewide",
  /** Set when Dani has a business inbox; the site shows the form only until then. */
  email: "" as string,
};

/** Wedding work first; everything else follows. Unknown slugs keep their admin order after these. */
export const CATEGORY_ORDER = ["weddings", "families-couples", "events", "portraits-creative", "nature-animals", "military-aviation"];

export type Service = {
  slug: "weddings" | "engagements" | "save-the-dates";
  name: string;
  kind: InquiryKind;
  summary: string;
  includes: string[];
  ask: string;
};

/** No prices here: packages and rates are set per couple (see CLAUDE.md). */
export const SERVICES: Service[] = [
  {
    slug: "weddings",
    name: "Weddings",
    kind: "wedding",
    summary: "Your whole day, from getting ready to the last dance.",
    includes: ["Ceremony, portraits, and reception", "Family and wedding party photos", "Private online gallery with downloads"],
    ask: "Check your date",
  },
  {
    slug: "engagements",
    name: "Engagements",
    kind: "engagement",
    summary: "A relaxed session at a place you choose.",
    includes: ["Photos for invitations and your website", "A chance to get comfortable on camera", "Proposals too, planned in secret"],
    ask: "Ask about engagements",
  },
  {
    slug: "save-the-dates",
    name: "Save the dates",
    kind: "save_the_date",
    summary: "Photos made for your announcement.",
    includes: ["Framed for cards and evites", "Works with the wedding website add-on", "Booked alone or with your wedding"],
    ask: "Ask about save the dates",
  },
];

export const ADD_ONS = [
  {
    slug: "video",
    name: "Video team",
    summary: "My partner video team films your day.",
    deal: "Book photo and video together and you pay less for both.",
  },
  {
    slug: "website",
    name: "Wedding website and evites",
    summary: "A save-the-date and RSVP website, with evites to send your guests.",
    deal: "Offered at a package rate when you book photography.",
  },
];

export const COMBINATIONS = [
  "Wedding photography",
  "Wedding + engagement session",
  "Wedding + engagement + save the dates",
  "Any of the above + video team",
  "Any of the above + wedding website and evites",
];

export const PROCESS = [
  { title: "Send your date", body: "Tell me your date, your venue, and what you need." },
  { title: "Get one clear quote", body: "Everything you picked, priced together, in writing." },
  { title: "Your wedding day", body: "I arrive early with a plan and a list of the photos you asked for." },
  { title: "Your gallery", body: "A private online gallery to view, share, and download." },
];

export const FAQ = [
  {
    q: "How much does it cost?",
    a: "It depends on what you combine. Send your date and what you need, and you get one quote with everything in it.",
  },
  { q: "Do you travel?", a: "Yes. I am based in Northeast Indiana and photograph weddings anywhere in the state." },
  { q: "How do we get our photos?", a: "In a private online gallery. You and your family can view, share, and download the full-quality files." },
  { q: "Can we add video or a website later?", a: "Yes. The combined rate applies when they are booked together with photography." },
  { q: "We already have a planner. Is that a problem?", a: "No. I work with your planner on the timeline and the photo list." },
];

export const PLANNER_POINTS = [
  { title: "Better rates for your couples", body: "Partner planners get a set rate to pass on to every couple they send." },
  { title: "One contact for more of the list", body: "Photography, a partner video team, and wedding websites with RSVP and evites." },
  { title: "The same team every time", body: "You know who is showing up, how they work, and when the gallery arrives." },
];

export const FAMILY_SESSIONS = {
  name: "Family sessions",
  summary: "Family, newborn, and mini sessions for the years after the wedding.",
  kind: "mini_session" as InquiryKind,
};
