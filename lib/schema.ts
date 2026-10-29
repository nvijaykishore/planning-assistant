const budgetLine = {
  type: "object",
  additionalProperties: false,
  required: ["category", "planned", "note", "priority"],
  properties: {
    category: { type: "string", description: "Short budget category, specific to this event." },
    planned: { type: "number", description: "Whole currency units planned for this line." },
    note: { type: "string", description: "One sentence on what this line covers for this event." },
    priority: { type: "string", enum: ["essential", "flexible"] },
  },
} as const;

const milestone = {
  type: "object",
  additionalProperties: false,
  required: ["offsetDays", "whenLabel", "title", "detail"],
  properties: {
    offsetDays: {
      type: "integer",
      description: "Days before the event. 0 is event day. Negative numbers are after the event.",
    },
    whenLabel: { type: "string", description: "Human label such as '6 months before' or 'Morning of'." },
    title: { type: "string" },
    detail: { type: "string", description: "One sentence. Actionable." },
  },
} as const;

const vendor = {
  type: "object",
  additionalProperties: false,
  required: ["category", "why", "bookBy", "budgetHint", "questions"],
  properties: {
    category: { type: "string", description: "Role, not a brand name." },
    why: { type: "string", description: "Why this role matters for this brief." },
    bookBy: { type: "string", description: "When to book, relative to the event." },
    budgetHint: { type: "string", description: "What this role should cost inside the budget, or 'borrow / potluck'." },
    questions: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string" },
      description: "Questions that mention a detail from the brief.",
    },
  },
} as const;

const idea = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "title", "detail"],
  properties: {
    kind: { type: "string", enum: ["theme", "menu", "activity", "decor", "favor", "moment"] },
    title: { type: "string" },
    detail: {
      type: "string",
      description: "Must mention a name, place, constraint, or feeling from the brief.",
    },
  },
} as const;

export const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "concept", "watchout", "contingency", "budgetLines", "timeline", "vendors", "ideas"],
  properties: {
    headline: { type: "string", description: "A specific title for this event, under 12 words." },
    concept: { type: "string", description: "Two short paragraphs of plain prose." },
    watchout: { type: "string", description: "One sentence: the real risk in this brief." },
    contingency: { type: "number", description: "Currency units held back, not a percentage." },
    budgetLines: { type: "array", minItems: 5, maxItems: 9, items: budgetLine },
    timeline: { type: "array", minItems: 6, maxItems: 12, items: milestone },
    vendors: { type: "array", minItems: 4, maxItems: 8, items: vendor },
    ideas: { type: "array", minItems: 6, maxItems: 8, items: idea },
  },
} as const;

export const REFINE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "budgetTotal", ...PLAN_SCHEMA.required],
  properties: {
    reply: {
      type: "string",
      description: "Two to four sentences: what changed, and what was protected.",
    },
    budgetTotal: {
      type: "number",
      description: "The working budget after this change. Same number unless the user asked to change it.",
    },
    ...PLAN_SCHEMA.properties,
  },
} as const;
