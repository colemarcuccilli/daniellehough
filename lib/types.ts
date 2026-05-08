export type IdeaStatus = "spark" | "active" | "done" | "archived";

export type IdeaType = "photo" | "video" | "series" | "mixed" | "other";

export type IdeaStep = {
  label: string;
  done: boolean;
};

export type Idea = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: IdeaType;
  status: IdeaStatus;
  weekly_step: string | null;
  step_index: number;
  steps: IdeaStep[];
  tags: string[];
  inspiration_urls: string[];
  notes: string | null;
  energy: number | null;
  created_at: string;
  activated_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
};

export const DEFAULT_STEPS: IdeaStep[] = [
  { label: "Concept", done: false },
  { label: "Shoot", done: false },
  { label: "Cull", done: false },
  { label: "Edit", done: false },
  { label: "Color", done: false },
  { label: "Deliver", done: false },
];

export const TYPE_LABELS: Record<IdeaType, string> = {
  photo: "Photo",
  video: "Video",
  series: "Series",
  mixed: "Mixed",
  other: "Other",
};
