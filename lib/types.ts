export const EVENT_KINDS = ["wedding", "birthday", "community"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "INR", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Brief = {
  kind: EventKind;
  honorees: string;
  city: string;
  date: string;
  guests: number;
  budget: number;
  currency: Currency;
  vibes: string[];
  feeling: string;
  mustHaves: string;
  constraints: string;
  notes: string;
};

export type BudgetLine = {
  id: string;
  category: string;
  planned: number;
  spent: number;
  note: string;
  priority: "essential" | "flexible";
};

export type Milestone = {
  id: string;
  offsetDays: number;
  whenLabel: string;
  title: string;
  detail: string;
  done: boolean;
};

export type VendorStatus = "not_started" | "researching" | "contacted" | "booked" | "skipped";

export type Vendor = {
  id: string;
  category: string;
  why: string;
  bookBy: string;
  budgetHint: string;
  questions: string[];
  status: VendorStatus;
};

export type IdeaKind = "theme" | "menu" | "activity" | "decor" | "favor" | "moment";

export type Idea = {
  id: string;
  kind: IdeaKind;
  title: string;
  detail: string;
  pinned: boolean;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Plan = {
  id: string;
  origin: "sample" | "generated";
  createdAt: string;
  updatedAt: string;
  brief: Brief;
  headline: string;
  concept: string;
  watchout: string;
  contingency: number;
  budgetLines: BudgetLine[];
  timeline: Milestone[];
  vendors: Vendor[];
  ideas: Idea[];
  chat: ChatMessage[];
};

export type RawBudgetLine = {
  category: string;
  planned: number;
  note: string;
  priority: "essential" | "flexible";
};

export type RawMilestone = {
  offsetDays: number;
  whenLabel: string;
  title: string;
  detail: string;
};

export type RawVendor = {
  category: string;
  why: string;
  bookBy: string;
  budgetHint: string;
  questions: string[];
};

export type RawIdea = {
  kind: IdeaKind;
  title: string;
  detail: string;
};

export type RawPlan = {
  headline: string;
  concept: string;
  watchout: string;
  contingency: number;
  budgetLines: RawBudgetLine[];
  timeline: RawMilestone[];
  vendors: RawVendor[];
  ideas: RawIdea[];
};
