import { scaleToTarget } from "./budget";
import { clipBlock, dollars, sameText, uid } from "./format";
import type {
  BudgetLine,
  ChatMessage,
  Idea,
  IdeaKind,
  Milestone,
  Plan,
  RawPlan,
  Vendor,
  VendorStatus,
} from "./types";
import type { Brief } from "./types";

const IDEA_KINDS: IdeaKind[] = ["theme", "menu", "activity", "decor", "favor", "moment"];

export function readRawPlan(input: unknown): RawPlan {
  if (!input || typeof input !== "object") throw new Error("The plan came back empty.");
  const body = input as Record<string, unknown>;
  const budgetLines = asArray(body.budgetLines)
    .map((line) => {
      const row = asRecord(line);
      const category = clipBlock(row.category, 80);
      if (!category) return null;
      return {
        category,
        planned: dollars(row.planned),
        note: clipBlock(row.note, 280),
        priority: row.priority === "essential" ? ("essential" as const) : ("flexible" as const),
      };
    })
    .filter((line): line is RawPlan["budgetLines"][number] => Boolean(line))
    .slice(0, 9);

  const timeline = asArray(body.timeline)
    .map((item) => {
      const row = asRecord(item);
      const title = clipBlock(row.title, 120);
      if (!title) return null;
      return {
        offsetDays: Math.round(Number(row.offsetDays) || 0),
        whenLabel: clipBlock(row.whenLabel, 60) || "Before the event",
        title,
        detail: clipBlock(row.detail, 320),
      };
    })
    .filter((item): item is RawPlan["timeline"][number] => Boolean(item))
    .slice(0, 12);

  const vendors = asArray(body.vendors)
    .map((item) => {
      const row = asRecord(item);
      const category = clipBlock(row.category, 80);
      if (!category) return null;
      const questions = asArray(row.questions)
        .map((question) => clipBlock(question, 220))
        .filter(Boolean)
        .slice(0, 4);
      return {
        category,
        why: clipBlock(row.why, 280),
        bookBy: clipBlock(row.bookBy, 80),
        budgetHint: clipBlock(row.budgetHint, 160),
        questions: questions.length ? questions : ["What is included, and what costs extra?"],
      };
    })
    .filter((item): item is RawPlan["vendors"][number] => Boolean(item))
    .slice(0, 8);

  const ideas = asArray(body.ideas)
    .map((item) => {
      const row = asRecord(item);
      const title = clipBlock(row.title, 120);
      const kind = IDEA_KINDS.find((candidate) => candidate === row.kind);
      if (!title || !kind) return null;
      return { kind, title, detail: clipBlock(row.detail, 320) };
    })
    .filter((item): item is RawPlan["ideas"][number] => Boolean(item))
    .slice(0, 8);

  if (budgetLines.length < 3) throw new Error("The budget came back too thin to use.");
  if (timeline.length < 3) throw new Error("The timeline came back too thin to use.");
  if (vendors.length < 2) throw new Error("The vendor list came back too thin to use.");
  if (ideas.length < 2) throw new Error("The ideas came back too thin to use.");

  const concept = clipBlock(body.concept, 1600);
  if (concept.length < 40) throw new Error("The concept came back empty.");

  return {
    headline: clipBlock(body.headline, 140) || "Untitled plan",
    concept,
    watchout: clipBlock(body.watchout, 320),
    contingency: dollars(body.contingency),
    budgetLines,
    timeline,
    vendors,
    ideas,
  };
}

export function materialize(brief: Brief, raw: RawPlan, previous?: Plan): Plan {
  const budgetLines = raw.budgetLines.map((line) => {
    const prior = previous?.budgetLines.find((item) => sameText(item.category, line.category));
    return {
      id: prior?.id ?? uid("bud"),
      category: line.category,
      planned: line.planned,
      spent: prior?.spent ?? 0,
      note: line.note,
      priority: line.priority,
    } satisfies BudgetLine;
  });
  const scaled = scaleToTarget(budgetLines, raw.contingency, brief.budget);
  const now = new Date().toISOString();

  return {
    id: previous?.id ?? uid("plan"),
    origin: previous?.origin ?? "generated",
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    brief,
    headline: raw.headline,
    concept: raw.concept,
    watchout: raw.watchout,
    contingency: scaled.contingency,
    budgetLines: scaled.lines.map((line) => ({
      ...line,
      spent: Math.max(0, line.spent),
    })),
    timeline: raw.timeline
      .map((item) => {
        const prior = previous?.timeline.find((milestone) => sameText(milestone.title, item.title));
        return {
          id: prior?.id ?? uid("mile"),
          offsetDays: item.offsetDays,
          whenLabel: item.whenLabel,
          title: item.title,
          detail: item.detail,
          done: prior?.done ?? false,
        } satisfies Milestone;
      })
      .sort((a, b) => b.offsetDays - a.offsetDays),
    vendors: raw.vendors.map((item) => {
      const prior = previous?.vendors.find((vendor) => sameText(vendor.category, item.category));
      return {
        id: prior?.id ?? uid("ven"),
        category: item.category,
        why: item.why,
        bookBy: item.bookBy,
        budgetHint: item.budgetHint,
        questions: item.questions,
        status: prior?.status ?? "not_started",
      } satisfies Vendor;
    }),
    ideas: raw.ideas.map((item) => {
      const prior = previous?.ideas.find((idea) => sameText(idea.title, item.title));
      return {
        id: prior?.id ?? uid("idea"),
        kind: item.kind,
        title: item.title,
        detail: item.detail,
        pinned: prior?.pinned ?? false,
      } satisfies Idea;
    }),
    chat: previous?.chat ?? [],
  };
}

export function applyRevision(
  plan: Plan,
  raw: RawPlan,
  budgetTotal: number,
  userMessage: string,
  reply: string,
): Plan {
  const nextBudget = dollars(budgetTotal) || plan.brief.budget;
  const next = materialize({ ...plan.brief, budget: nextBudget }, raw, plan);
  const chat: ChatMessage[] = [
    ...plan.chat,
    { role: "user", content: userMessage },
    { role: "assistant", content: reply },
  ];
  return {
    ...next,
    chat: chat.slice(-20),
  };
}

export function vendorStatuses(): VendorStatus[] {
  return ["not_started", "researching", "contacted", "booked", "skipped"];
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
