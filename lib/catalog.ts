import type { Brief, EventKind } from "./types";
import { isoIn } from "./format";

export const KIND_META: Record<
  EventKind,
  { label: string; numeral: string; line: string; plural: string }
> = {
  wedding: {
    label: "Wedding",
    numeral: "01",
    line: "Families, a meal, and the promises between them.",
    plural: "weddings",
  },
  birthday: {
    label: "Birthday",
    numeral: "02",
    line: "One person, and the room that knows them.",
    plural: "birthdays",
  },
  community: {
    label: "Community",
    numeral: "03",
    line: "A block, a cause, or a room that belongs to everyone.",
    plural: "community events",
  },
};

export const VIBES: Record<EventKind, string[]> = {
  wedding: [
    "Garden",
    "City hall",
    "House of worship",
    "Backyard",
    "Seated dinner",
    "Brunch",
    "Multicultural",
    "Under 40 guests",
  ],
  birthday: ["Kids", "Milestone", "Surprise", "Dinner", "Backyard", "Theme", "Potluck"],
  community: ["Block party", "Fundraiser", "Volunteer day", "Cultural", "Memorial", "Meeting", "Potluck"],
};

export const PROMPTS: Record<EventKind, string[]> = {
  wedding: [
    "Cut 15% without touching the meal.",
    "What has to be booked in the next 30 days?",
    "Add a rain plan that keeps the ceremony feeling intact.",
    "Give me one more menu idea that fits the constraints.",
  ],
  birthday: [
    "Lower the budget by 15% and protect the cake.",
    "What should we actually do this week?",
    "Add two activities that fit the people in the room.",
    "Simplify the vendor list to what this budget can hold.",
  ],
  community: [
    "What can neighbors donate instead of buy?",
    "Add a rain plan that keeps the budget.",
    "Make the timeline something a volunteer can run.",
    "Which permits should we double-check?",
  ],
};

export function emptyBrief(kind: EventKind = "wedding"): Brief {
  return {
    kind,
    honorees: "",
    city: "",
    date: "",
    guests: kind === "wedding" ? 80 : kind === "birthday" ? 16 : 40,
    budget: kind === "wedding" ? 25000 : kind === "birthday" ? 800 : 500,
    currency: "USD",
    vibes: [],
    feeling: "",
    mustHaves: "",
    constraints: "",
    notes: "",
  };
}

export function demoBrief(kind: EventKind): Brief {
  if (kind === "birthday") {
    return {
      kind,
      honorees: "Mateo, turning 7",
      city: "Brooklyn, New York",
      date: isoIn(24),
      guests: 14,
      budget: 1800,
      currency: "USD",
      vibes: ["Kids", "Backyard", "Theme"],
      feeling: "A backyard dig site, not a restaurant birthday",
      mustHaves: "A fossil dig in the yard, a cake he helps smash, and pizza, because that is the food he will eat.",
      constraints:
        "One guest has a severe peanut allergy. The yard has no shade after 2pm. Two grandparents need chairs with backs.",
      notes: "Ana and Luis are hosting. The party runs 1pm to 4pm. The budget is firm.",
    };
  }
  if (kind === "community") {
    return {
      kind,
      honorees: "Neighbors on Riverside Avenue",
      city: "Jersey City, New Jersey",
      date: isoIn(12),
      guests: 60,
      budget: 600,
      currency: "USD",
      vibes: ["Volunteer day", "Potluck", "Block party"],
      feeling: "Useful first, festive second",
      mustHaves: "A morning litter cleanup, then a potluck on the closed street.",
      constraints:
        "The sidewalk route has to work for a wheelchair. Flyers need English, Spanish, and Bengali. No open flame.",
      notes: "The block association has a borrowed speaker. Insurance may already be covered by the permit — check, do not assume.",
    };
  }
  return {
    kind: "wedding",
    honorees: "Priya and Jonah",
    city: "Hudson Valley, New York",
    date: isoIn(220),
    guests: 110,
    budget: 42000,
    currency: "USD",
    vibes: ["Garden", "Multicultural", "Seated dinner"],
    feeling: "An orchard afternoon that becomes a long dinner",
    mustHaves: "A Hindu ceremony and a Jewish ceremony under the same sailcloth tent, then a seated vegetarian-forward dinner.",
    constraints: "Guests are split across two cities, so a shuttle matters. June rain is likely. Several guests do not eat meat.",
    notes: "Families are hosting together. They want a coordinator. They do not want a band if a trio and a playlist will carry the night.",
  };
}
