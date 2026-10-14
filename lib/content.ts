import type { InquiryKind } from "@/lib/types";

export const SITE = {
  name: "Dani Cams",
  owner: "Danielle Hough",
  tagline: "Photography for businesses and families across Indiana.",
  region: "Fort Wayne & Northeast Indiana · travels statewide",
  /** Set when Dani has a business inbox; the site shows the form only until then. */
  email: "" as string,
};

export type Offer = {
  slug: string;
  name: string;
  tag?: string;
  summary: string;
  includes: string[];
  terms?: string[];
  kind: InquiryKind;
};

export const PLANS: Offer[] = [
  {
    slug: "quarterly",
    name: "Quarterly Photography",
    tag: "Quarterly",
    kind: "retainer",
    summary: "One capture day every quarter. You pick what it points at.",
    includes: [
      "Facility, event, headshots, product, or process",
      "Edited, captioned, delivered to a shared folder",
      "Annual headshot day included",
    ],
    terms: ["Use it within the quarter", "Two weeks notice on event dates"],
  },
  {
    slug: "monthly",
    name: "Monthly Photography",
    tag: "Monthly",
    kind: "retainer",
    summary: "One session a month for businesses that post every week.",
    includes: ["Restaurants, hospitality, multi-location groups", "Capped image count", "Delivered ready to post"],
    terms: ["Managed posting not included"],
  },
];

export const ADD_ONS = [
  { name: "Drone", body: "Facility aerials yearly, or monthly progress on construction sites." },
  { name: "Vertical video", body: "Short vertical clips from the same session." },
  { name: "Extra capture days", body: "For launches, openings, and events." },
];

export const ONE_OFFS: Offer[] = [
  {
    slug: "headshots",
    name: "Headshot days",
    kind: "headshots",
    summary: "The whole team, one visit, one look.",
    includes: ["Setup at your location", "Web and print sizes"],
  },
  {
    slug: "product",
    name: "Product, menu & facility",
    kind: "product",
    summary: "Menus, product lines, showrooms, facilities.",
    includes: ["Shot list agreed ahead", "Matches your existing brand"],
  },
  {
    slug: "events",
    name: "Events",
    kind: "event",
    summary: "Fundraisers, openings, race days, company events.",
    includes: ["Candid and posed", "Highlights within the week"],
  },
];

export const MINI_SESSIONS = {
  name: "Mini sessions",
  duration: "15 minutes",
  summary: "Quick sessions for families and individuals, a few dates a year.",
  includes: ["Three prints", "A small set of digitals", "No watermarks"],
  upsell: "Full gallery available after the session.",
  kind: "mini_session" as InquiryKind,
};

export const PROCESS = [
  { step: "01", title: "Pick the target", body: "A short call to decide what the photographs need to do." },
  { step: "02", title: "Capture day", body: "I show up ready and work the shot list." },
  { step: "03", title: "Edit and caption", body: "One consistent look, captioned." },
  { step: "04", title: "Delivered to your folder", body: "Sized for web and print, ready to post." },
];
