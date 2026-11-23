export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  cover_photo_id: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  category_id: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  client: string | null;
  location: string | null;
  shot_on: string | null;
  cover_photo_id: string | null;
  sort_order: number;
  is_published: boolean;
  is_featured: boolean;
  /** Client gallery: unlisted share link at /gallery/<gallery_slug>. */
  gallery_slug: string | null;
  gallery_enabled: boolean;
  gallery_downloads: boolean;
  gallery_intro: string | null;
  /** Optional masthead image (site-relative path or URL); falls back to the cover photo. */
  gallery_cover_url: string | null;
  created_at: string;
  updated_at: string;
};

/** A part of an event inside a project (ceremony, cocktail hour, reception…). */
export type Section = {
  id: string;
  project_id: string;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  project_id: string;
  section_id: string | null;
  original_path: string;
  web_path: string;
  width: number;
  height: number;
  bytes: number | null;
  blur_data_url: string | null;
  dominant_color: string | null;
  alt: string | null;
  caption: string | null;
  sort_order: number;
  is_published: boolean;
  taken_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InquiryKind =
  | "wedding"
  | "engagement"
  | "save_the_date"
  | "planner"
  | "retainer"
  | "headshots"
  | "event"
  | "product"
  | "mini_session"
  | "other";

export type InquiryStatus = "new" | "read" | "replied" | "archived";

export type Inquiry = {
  id: string;
  kind: InquiryKind;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  budget: string | null;
  timeline: string | null;
  location: string | null;
  source: string | null;
  status: InquiryStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export const INQUIRY_KINDS: Record<InquiryKind, string> = {
  wedding: "Wedding photography",
  engagement: "Engagement session",
  save_the_date: "Save-the-date photos",
  planner: "Wedding planner partnership",
  retainer: "Business photography",
  headshots: "Headshot day",
  event: "Event coverage",
  product: "Product, menu, or facility shoot",
  mini_session: "Family or mini session",
  other: "Something else",
};

/** What the public form offers. Older kinds stay valid for past inquiries. */
export const PUBLIC_INQUIRY_KINDS: InquiryKind[] = [
  "wedding",
  "engagement",
  "save_the_date",
  "mini_session",
  "planner",
  "retainer",
  "other",
];

export const ALL_INQUIRY_KINDS = Object.keys(INQUIRY_KINDS) as InquiryKind[];

/** Things a couple can add to a wedding package; sent with the inquiry. */
export const PACKAGE_EXTRAS = [
  { value: "engagement", label: "Engagement session" },
  { value: "save_the_date", label: "Save-the-date photos" },
  { value: "video", label: "Video team" },
  { value: "website", label: "Wedding website and evites" },
] as const;

export const INQUIRY_KIND_SHORT: Record<InquiryKind, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  save_the_date: "Save the date",
  planner: "Planner",
  retainer: "Business",
  headshots: "Headshots",
  event: "Event",
  product: "Product / facility",
  mini_session: "Mini session",
  other: "Other",
};

export const INQUIRY_STATUSES: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

export const BUDGET_OPTIONS = [
  "Under $500",
  "$500 – $1,500",
  "$1,500 – $5,000",
  "$5,000+",
  "Not sure yet",
] as const;

/** Project with its cover resolved (either the chosen cover or the first published photo). */
export type ProjectWithCover = Project & {
  cover: Photo | null;
  photo_count: number;
  category?: Pick<Category, "id" | "slug" | "name"> | null;
};

export type CategoryWithCover = Category & {
  cover: Photo | null;
  project_count: number;
  photo_count: number;
};
