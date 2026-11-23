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
    summary: "Photos for the announcement.",
    includes: ["Sized for cards and evites", "Combines with the wedding package", "Online gallery, full-quality downloads"],
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

/**
 * Cloudflare Stream videos, in display order. The wedding film and the
 * save-the-date video are made by Sweet Dreams, a separate film team hired in
 * addition to photography. The social media recap comes free with every
 * wedding photo package.
 */
export const FILMS: Film[] = [
  {
    id: "78c8e2c6224bee3ab39b9eb056bd6b55",
    title: "Wedding film",
    label: "Sweet Dreams film team",
    note: "Booked in addition to photography.",
    posterAt: 19,
  },
  {
    id: "aba5343289e3f79c7b11974a0d839e57",
    title: "Save-the-date video",
    label: "Sweet Dreams film team",
    note: "Booked in addition to photography.",
    posterAt: 25,
  },
  {
    id: "e7102fe5a6fbcd387e8f25a6a9a8d6a7",
    title: "Social media recap",
    label: "Free with wedding photography",
    note: "Included in every wedding package.",
    vertical: true,
    posterAt: 4,
  },
];

export const filmPoster = (f: Film) => `${STREAM}/${f.id}/thumbnails/thumbnail.jpg?time=${f.posterAt}s&height=${f.vertical ? 1100 : 720}`;
export const filmEmbed = (f: Film) => `${STREAM}/${f.id}/iframe?autoplay=true&poster=${encodeURIComponent(filmPoster(f))}`;

/**
 * The offer (owner, 2026-11-23). Two photo packages. Every wedding package
 * includes the social media recap. Wedding + engagement also includes the
 * wedding website. A full wedding film is a separate team, hired in addition.
 * No prices yet.
 */
export const PACKAGES = [
  {
    name: "Wedding",
    kind: "wedding" as InquiryKind,
    includes: ["Wedding day photography", "Online gallery, full-quality downloads"],
    free: ["Social media recap video"],
  },
  {
    name: "Wedding + engagement",
    kind: "wedding" as InquiryKind,
    includes: ["Wedding day photography", "Engagement or save-the-date session", "Online gallery, full-quality downloads"],
    free: ["Social media recap video", "Wedding website: save the date, RSVP, evites"],
  },
];

export const FILM_ADD_ON = {
  name: "Wedding film",
  body: "A separate film team, Sweet Dreams, hired in addition to photography. Wedding films and save-the-date videos.",
};

/**
 * Wedding, engagement and save-the-date projects on the portfolio page. Each
 * card opens the project's gallery page (sections, full-quality downloads).
 * `project` is the gallery project's slug. Add a line here when a
 * new gallery should appear; galleries are never listed automatically.
 */
export const WEDDING_PROJECTS = [
  {
    project: "blakeley-wedding",
    slug: "las-vegas-wedding",
    title: "Las Vegas Wedding",
    kind: "Wedding",
    place: "Las Vegas",
    cover: "blakeley-wedding/dsc-2054-pm8mly.jpg",
    thumb: "blakeley-wedding/dsc-2242-syjqkx.jpg",
  },
  {
    project: "hunkin-wedding",
    slug: "playa-del-carmen-wedding",
    title: "Playa del Carmen Wedding",
    kind: "Wedding",
    place: "Playa del Carmen",
    cover: "hunkin-wedding/sd507153-e0g4h3.jpg",
    thumb: "hunkin-wedding/sd507183-17bw9g.jpg",
  },
  {
    project: "ball-engagement",
    slug: "lake-engagement",
    title: "Engagement on the Lake",
    kind: "Engagement",
    place: "Indiana",
    cover: "ball-engagement/dsc-9770-ffh854.jpg",
    thumb: "ball-engagement/dsc-0030-15lppe.jpg",
  },
  {
    project: "gage-lexi-save-the-date",
    slug: "dock-save-the-date",
    title: "Save the Date on the Dock",
    kind: "Save the date",
    place: "Indiana",
    cover: "gage-lexi-save-the-date/sd504875-djzsj3.jpg",
    thumb: "gage-lexi-save-the-date/sd504824-2-wir7wo.jpg",
  },
] as const;

/** Published portfolio projects that belong with the couples work, shown right after the weddings. */
export const COUPLES_PROJECT_SLUGS = ["lakeside-proposal"];

/**
 * Photos shown on the site, from the client galleries the owner cleared for
 * public use (2026-11-23: any wedding, engagement, or family gallery). The
 * order mixes the shoots on purpose: no single couple leads the site. A new
 * gallery with no picks here is sampled automatically and appended.
 */
export const HERO_SLIDES = [
  "blakeley-wedding/dsc-2054-pm8mly.jpg",
  "ball-engagement/dsc-9770-ffh854.jpg",
  "hunkin-wedding/sd506984-moekmi.jpg",
];

export const CARD_PHOTOS = {
  weddings: "blakeley-wedding/dsc-2201-2-ubqzu9.jpg",
  engagements: "ball-engagement/dsc-0162-fwltxf.jpg",
  "save-the-dates": "ball-engagement/dsc-0694-6fxalu.jpg",
} as const;

export const FEATURED_PHOTOS = [
  "blakeley-wedding/dsc-2242-syjqkx.jpg",
  "ball-engagement/dsc-0030-15lppe.jpg",
  "gage-lexi-save-the-date/sd504824-2-wir7wo.jpg",
  "hunkin-wedding/sd507183-17bw9g.jpg",
  "blakeley-wedding/dsc-3884-mi3t4j.jpg",
  "ball-engagement/dsc-0472-vygts4.jpg",
  "gage-lexi-save-the-date/sd504875-djzsj3.jpg",
  "hunkin-wedding/sd506912-iingfd.jpg",
  "blakeley-wedding/dsc-2034-xmb6hs.jpg",
  "ball-engagement/dsc-0613-dc2sfa.jpg",
  "gage-lexi-save-the-date/sd504973-5i5sqb.jpg",
  "blakeley-wedding/dsc-2583-2-nzfm1l.jpg",
  "hunkin-wedding/sd507170-mpgiak.jpg",
  "blakeley-wedding/dsc-3857-aqgxc2.jpg",
  "gage-lexi-save-the-date/sd504898-cbxe2s.jpg",
  "ball-engagement/dsc-0090-usme13.jpg",
  "hunkin-wedding/sd507142-2-uk8i9s.jpg",
  "blakeley-wedding/dsc-2291-g6oaym.jpg",
  "gage-lexi-save-the-date/sd505046-ufxwrb.jpg",
  "ball-engagement/dsc-9751-o69cj8.jpg",
  "hunkin-wedding/sd506925-aahxnj.jpg",
  "blakeley-wedding/dsc-3909-al3pxp.jpg",
  "ball-engagement/dsc-0637-jnfzhc.jpg",
  "hunkin-wedding/sd506874-f5snst.jpg",
  "blakeley-wedding/dsc-2107-lh3tzm.jpg",
  "ball-engagement/dsc-0268-vj017f.jpg",
  "hunkin-wedding/sd506921-m1xk2l.jpg",
  "blakeley-wedding/dsc-2220-utwafc.jpg",
  "hunkin-wedding/sd507149-wyiwok.jpg",
  "hunkin-wedding/sd507153-e0g4h3.jpg",
];

export const FAQ = [
  { q: "What does it cost?", a: "Each package is quoted for the wedding. Send the date and the package. The quote covers all of it." },
  { q: "What comes free?", a: "The social media recap video, with every wedding package. The wedding website, with wedding + engagement." },
  { q: "Who makes the wedding film?", a: "Sweet Dreams, a separate film team. It is hired in addition to photography." },
  { q: "Where?", a: "Based in Northeast Indiana. Weddings anywhere in the state, and destination weddings." },
  { q: "How do we get the photos?", a: "A private online gallery. View, share, download the full-quality files." },
];

export const PLANNER_POINTS = [
  { title: "Partner rate", body: "A set rate for every couple you send." },
  { title: "Photo, recap, website", body: "Photography with the social media recap and wedding website included. Sweet Dreams films in addition." },
  { title: "Same team", body: "The same people at every wedding." },
];

export const FAMILY_SESSIONS = {
  name: "Family sessions",
  summary: "Family, newborn, and mini sessions.",
  kind: "mini_session" as InquiryKind,
};
