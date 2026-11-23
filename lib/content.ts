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

/** No prices here yet: the offer and rates come later (see CLAUDE.md). Say what it is, nothing more. */
export const SERVICES: Service[] = [
  {
    slug: "weddings",
    name: "Weddings",
    kind: "wedding",
    summary: "Ceremony, portraits, reception.",
    includes: ["Full day", "Family and wedding party", "Online gallery, full-quality downloads"],
    ask: "Check your date",
  },
  {
    slug: "engagements",
    name: "Engagements",
    kind: "engagement",
    summary: "Engagement sessions and proposals.",
    includes: ["Location of your choice", "Photos for invitations and your website", "Online gallery, full-quality downloads"],
    ask: "Book an engagement",
  },
  {
    slug: "save-the-dates",
    name: "Save the dates",
    kind: "save_the_date",
    summary: "Photos and films for the announcement.",
    includes: ["Sized for cards and evites", "Save-the-date film", "Pairs with the wedding website"],
    ask: "Book save the dates",
  },
];

const STREAM = "https://customer-w6h9o08eg118alny.cloudflarestream.com";

export type Film = {
  id: string;
  title: string;
  label: string;
  note: string;
  vertical?: boolean;
  /** Second of the film used for the poster frame. */
  posterAt: number;
};

/** Cloudflare Stream videos. The two films are produced with Sweet Dreams; the recap is the lower-cost option. */
export const FILMS: Film[] = [
  {
    id: "78c8e2c6224bee3ab39b9eb056bd6b55",
    title: "Wedding film",
    label: "Film · with Sweet Dreams",
    note: "Full production. The day, start to finish.",
    posterAt: 6,
  },
  {
    id: "aba5343289e3f79c7b11974a0d839e57",
    title: "Save-the-date film",
    label: "Film · with Sweet Dreams",
    note: "Full production. Made to send with the invitation.",
    posterAt: 4,
  },
  {
    id: "e7102fe5a6fbcd387e8f25a6a9a8d6a7",
    title: "Social recap",
    label: "Recap",
    note: "Vertical, for social. Costs less than a film.",
    vertical: true,
    posterAt: 4,
  },
];

export const filmPoster = (f: Film) => `${STREAM}/${f.id}/thumbnails/thumbnail.jpg?time=${f.posterAt}s&height=${f.vertical ? 1100 : 720}`;
export const filmEmbed = (f: Film) => `${STREAM}/${f.id}/iframe?autoplay=true&poster=${encodeURIComponent(filmPoster(f))}`;

/** The offer, as a list. Photography is the base; the rest is added to it. */
export const OFFER = [
  { name: "Photography", body: "Weddings, engagements, save the dates." },
  { name: "Film", body: "Wedding films and save-the-date films, with Sweet Dreams." },
  { name: "Social recap", body: "Vertical video of the day. Costs less than a film." },
  { name: "Wedding website", body: "Save the date, RSVP, evites." },
];

/**
 * Wedding photos shown on the site, in order. Paths are from the client
 * galleries the owner cleared for public use (2026-11-23). Any other gallery
 * whose slug says wedding or engagement is sampled automatically after these.
 */
export const FEATURED_WEDDING_PHOTOS = [
  "hunkin-wedding/sd507153-e0g4h3.jpg",
  "hunkin-wedding/sd506874-f5snst.jpg",
  "hunkin-wedding/sd507183-17bw9g.jpg",
  "hunkin-wedding/sd506912-iingfd.jpg",
  "hunkin-wedding/sd507149-wyiwok.jpg",
  "hunkin-wedding/sd506877-1-cv9kcl.jpg",
  "hunkin-wedding/sd507170-mpgiak.jpg",
  "hunkin-wedding/sd506921-m1xk2l.jpg",
  "hunkin-wedding/sd507142-2-uk8i9s.jpg",
  "hunkin-wedding/sd506984-moekmi.jpg",
  "hunkin-wedding/sd506886-1-rmvki5.jpg",
  "hunkin-wedding/sd507167-s1r0nr.jpg",
  "hunkin-wedding/sd506925-aahxnj.jpg",
  "hunkin-wedding/sd506937-zeqdh8.jpg",
  "hunkin-wedding/sd507144-kmvf0y.jpg",
  "hunkin-wedding/sd506878-bv5nrl.jpg",
];

export const FAQ = [
  { q: "What does it cost?", a: "Each package is quoted for the wedding. Send the date and what you want. The quote covers all of it." },
  { q: "Where?", a: "Based in Northeast Indiana. Weddings anywhere in the state, and destination weddings." },
  { q: "How do we get the photos?", a: "A private online gallery. View, share, download the full-quality files." },
  { q: "Who makes the films?", a: "Sweet Dreams, the partner video team. Photo and film booked together cost less than booked apart." },
  { q: "Is there a lower-cost video?", a: "Yes. The social recap: a vertical video of the day, without a full film crew." },
];

export const PLANNER_POINTS = [
  { title: "Partner rate", body: "A set rate for every couple you send." },
  { title: "Photo, film, website", body: "One contact for photography, Sweet Dreams films, and wedding websites with RSVP and evites." },
  { title: "Same team", body: "The same people at every wedding." },
];

export const FAMILY_SESSIONS = {
  name: "Family sessions",
  summary: "Family, newborn, and mini sessions.",
  kind: "mini_session" as InquiryKind,
};
