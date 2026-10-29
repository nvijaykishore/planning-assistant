import { isoIn } from "./format";
import type { BudgetLine, Idea, Milestone, Plan, Vendor } from "./types";

const STAMP = "2026-10-01T12:00:00.000Z";

export function getSample(id: string): Plan | null {
  if (id === "sample-wedding") return wedding();
  if (id === "sample-birthday") return birthday();
  if (id === "sample-community") return community();
  return null;
}

export function sampleIds(): string[] {
  return ["sample-wedding", "sample-birthday", "sample-community"];
}

function wedding(): Plan {
  return {
    id: "sample-wedding",
    origin: "sample",
    createdAt: STAMP,
    updatedAt: STAMP,
    brief: {
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
    },
    headline: "Orchard tent, two ceremonies, one long table",
    concept:
      "Priya and Jonah marry under a sailcloth tent at a Hudson Valley orchard, with a Hindu ceremony in the afternoon and a Jewish ceremony in the same place before dinner. One hundred and ten guests sit down to a vegetarian-forward meal. The orchard does the scenic work, so the flowers stay low and local.\n\nThe money protects the tent, the meal, and a coordinator. A trio covers both ceremonies. Dinner can ride a playlist. A shuttle is not a luxury here: the guest list really does split across two cities, and June rain gets its own line instead of a hopeful sentence.",
    watchout: "The rain plan has to be booked with the tent, not invented the week of the wedding.",
    contingency: 4200,
    budgetLines: [
      line("w1", "Orchard and sailcloth tent", 12600, "Site fee, tent, sides, lighting, and a written rain call.", "essential", 0),
      line("w2", "Catering", 14700, "Seated vegetarian-forward dinner, tasting, and staff for 110.", "essential", 2000),
      line("w3", "Photography", 3360, "Two shooters who have stood through both ceremonies.", "essential", 800),
      line("w4", "Attire and ceremony pieces", 2520, "Clothing alterations plus the items both ceremonies need.", "flexible", 0),
      line("w5", "Flowers and low decor", 1680, "Local branches and table greens. The orchard is the backdrop.", "flexible", 0),
      line("w6", "Trio and dinner playlist", 1470, "Live trio for the ceremonies, then a playlist through dinner.", "flexible", 0),
      line("w7", "Paper and signage", 630, "Save-the-dates with the shuttle note, and a seating board.", "flexible", 0),
      line("w8", "Shuttle", 840, "One loop between the station and the orchard.", "flexible", 0),
    ],
    timeline: [
      mile("w1", 200, "About 7 months before", "Hold the orchard and the tent", "Put the rain call in the contract before the deposit clears.", true),
      mile("w2", 160, "About 5 months before", "Book the photographers", "Ask where they stand during the pheras and the circling.", true),
      mile("w3", 120, "4 months before", "Catering tasting", "Taste the vegetarian mains the meat-eating tables will also be served.", false),
      mile("w4", 90, "3 months before", "Save-the-dates", "Include the shuttle time so out-of-town guests can plan the train.", false),
      mile("w5", 60, "2 months before", "Order of service", "Both officiants agree who speaks, and in what order, under one tent.", false),
      mile("w6", 30, "1 month before", "Seating and the kitchen list", "Allergies and the no-meat tables go to the caterer in writing.", false),
      mile("w7", 14, "2 weeks before", "Final count and payments", "Confirm the coordinator's hour-by-hour and what is still unpaid.", false),
      mile("w8", 1, "Day before", "Rain call", "Tent company, coordinator, and families make the call together.", false),
      mile("w9", 0, "Event day", "Two ceremonies, then dinner", "Hindu ceremony, Jewish ceremony, photos, seated dinner.", false),
      mile("w10", -7, "The week after", "Thank-yous and balances", "Pay what is left and send the notes while the day is still close.", false),
    ],
    vendors: [
      vendor(
        "w1",
        "Orchard and tent",
        "The site and the weather plan are the same decision.",
        "7 months before",
        "About $12,600, already in the ledger.",
        ["If it rains at 2pm, do we keep both ceremonies under the tent without moving guests?", "What is the latest rain call, and who phones whom?"],
        "booked",
      ),
      vendor(
        "w2",
        "Caterer",
        "The meal is the largest line, and it has to feed guests who do not eat meat without making a separate sad plate.",
        "4 months before",
        "About $134 a guest for food and service.",
        ["Can the whole dinner be vegetarian-forward, with meat as a side for the tables that want it?", "How are nut and gluten notes marked for the kitchen and the floor?"],
        "researching",
      ),
      vendor(
        "w3",
        "Photographers",
        "Two ceremonies in one afternoon need someone who will not miss either.",
        "5 months before",
        "About $3,360 for two shooters.",
        ["Have you photographed pheras and a chuppah on the same day?", "If a shooter is ill that week, who arrives instead?"],
        "contacted",
      ),
      vendor(
        "w4",
        "Day-of coordinator",
        "At 110 guests and two ceremonies, someone other than the couple has to hold the clock.",
        "4 months before",
        "Pay this before you add a band.",
        ["Will you run the rain call with the tent company?", "Have you cued a Hindu and a Jewish ceremony back to back?"],
        "not_started",
      ),
      vendor(
        "w5",
        "Shuttle",
        "The guest list really is split across two cities.",
        "2 months before",
        "About $840 for one station loop.",
        ["Can the loop match the ceremony start, not a generic wedding timeline?", "What happens if the train is late?"],
        "not_started",
      ),
    ],
    ideas: [
      idea("w1", "moment", "One tent, two ceremonies", "Priya's pheras and Jonah's circling happen in the same sailcloth room, with a quiet reset between them instead of a venue change."),
      idea("w2", "menu", "Orchard dinner, mostly plants", "A seated meal the vegetarian guests can eat all the way through, with the Hudson Valley produce doing the decorating."),
      idea("w3", "activity", "Short garba, then a hora", "Ten minutes of each, while people can still stand, instead of a band that would eat the shuttle budget."),
      idea("w4", "decor", "Branches from the orchard", "Low greens on the long table. The trees are already the room."),
      idea("w5", "favor", "Train-station cookies", "A small tin for the shuttle ride back, labeled for the nut-free table."),
      idea("w6", "theme", "Afternoon into lamplight", "Ceremony in the orchard light, dinner after the tent lamps come on. No uplighting package."),
    ],
    chat: [],
  };
}

function birthday(): Plan {
  return {
    id: "sample-birthday",
    origin: "sample",
    createdAt: STAMP,
    updatedAt: STAMP,
    brief: {
      kind: "birthday",
      honorees: "Mateo, turning 7",
      city: "Brooklyn, New York",
      date: isoIn(40),
      guests: 14,
      budget: 1800,
      currency: "USD",
      vibes: ["Kids", "Backyard", "Theme"],
      feeling: "A backyard dig site, not a restaurant birthday",
      mustHaves: "A fossil dig, a cake he helps smash, and pizza.",
      constraints: "One guest has a severe peanut allergy. No shade after 2pm. Two grandparents need chairs with backs.",
      notes: "Ana and Luis host from 1pm to 4pm. The budget is firm.",
    },
    headline: "A fossil dig behind Ana and Luis's house",
    concept:
      "Mateo turns 7 in a Brooklyn backyard dressed as a dig site, not a restaurant. Fourteen people, pizza, a cake he smashes himself, and a pit of sand where the fossils are buried before anyone arrives.\n\nThe budget stays home. Shade is a real line item because the yard is exposed after 2pm, and the party starts at 1. One guest cannot be near peanuts, so the cake order and the pizza order both say that out loud. Two grandparents get chairs with backs, which is cheaper than a single rental package and more useful.",
    watchout: "A peanut-safe cake is a spoken order at the bakery, not a hope on the day.",
    contingency: 140,
    budgetLines: [
      line("b1", "Shade and chairs", 380, "A shade sail for the 2pm sun, plus two chairs with backs.", "essential", 0),
      line("b2", "Pizza and drinks", 390, "Plain pies and a separate nut-free box, labeled.", "essential", 0),
      line("b3", "Cake", 210, "A small smash cake from a bakery that can keep peanuts out.", "essential", 0),
      line("b4", "Fossil dig", 480, "Sand, brushes, and plaster fossils for 14 diggers.", "flexible", 0),
      line("b5", "Favors", 120, "A tiny fossil and a card for each kid.", "flexible", 0),
      line("b6", "Paper goods", 80, "Plates, a nut-free sign, and name tags for the dig teams.", "flexible", 0),
    ],
    timeline: [
      mile("b1", 35, "5 weeks before", "Build the fossil kit", "Bury nothing yet. Count brushes so every kid has one.", false),
      mile("b2", 21, "3 weeks before", "Order the cake", "Say the peanut allergy on the phone and again in the order notes.", false),
      mile("b3", 14, "2 weeks before", "Ask the neighbor about noise", "The party is 1pm to 4pm. Agree on music before the day.", false),
      mile("b4", 7, "1 week before", "Buy the shade sail", "Aim it at the part of the yard that loses shade at 2pm.", false),
      mile("b5", 2, "2 days before", "Set the dig pit", "Wet the sand once so it holds, and keep the cake off that table.", false),
      mile("b6", 0, "Party day", "Dig, pizza, smash cake", "1pm start. Grandparent chairs placed before guests arrive.", false),
      mile("b7", -1, "The day after", "Send the photos", "Ana's sister gets the set. Hose out the sand.", false),
    ],
    vendors: [
      vendor(
        "b1",
        "Nut-free bakery",
        "The cake is small. The allergy is not.",
        "3 weeks before",
        "About $210.",
        ["Can you confirm the cake is made without peanuts, in writing?", "Can Mateo smash a six-inch cake without a cutting fee?"],
        "not_started",
      ),
      vendor(
        "b2",
        "Pizza shop",
        "This is the meal. Keep a plain pie in its own box.",
        "1 week before",
        "About $390 with drinks.",
        ["Can one box be packed separately and labeled nut-free?", "What time do pies for a 1pm party actually leave the shop?"],
        "not_started",
      ),
      vendor(
        "b3",
        "Shade and chairs",
        "Bought or borrowed. Not a party-rental account.",
        "1 week before",
        "About $380.",
        ["Does the shade sail cover the table after 2pm, not just the morning?", "Which two chairs have backs the grandparents can sit in for an hour?"],
        "researching",
      ),
      vendor(
        "b4",
        "Dig supplies",
        "A hardware-store run, not an entertainer.",
        "5 weeks before",
        "About $480 for sand, brushes, and fossils.",
        ["How much sand fills a pit fourteen kids can share without a fight?", "What fossils survive being brushed by a 7-year-old?"],
        "not_started",
      ),
    ],
    ideas: [
      idea("b1", "theme", "Backyard dig site", "Mateo's Brooklyn yard, marked with string and one nut-free sign, not a banquet hall centerpiece."),
      idea("b2", "activity", "Teams of two with brushes", "Fourteen kids, so seven pairs. The grandparents judge the finds from chairs with backs."),
      idea("b3", "menu", "Plain pizza, separate box", "The peanut allergy gets its own labeled box on a different table from the sand."),
      idea("b4", "moment", "He smashes the small cake", "Mateo, at 3pm, in the shade, before the sugar hits the dig pit."),
      idea("b5", "favor", "One fossil each", "A plaster fossil and a card. No candy, because of the peanut allergy."),
      idea("b6", "decor", "String grid and a shade sail", "The decor is the pit and the sail that covers it after 2pm."),
    ],
    chat: [],
  };
}

function community(): Plan {
  return {
    id: "sample-community",
    origin: "sample",
    createdAt: STAMP,
    updatedAt: STAMP,
    brief: {
      kind: "community",
      honorees: "Neighbors on Riverside Avenue",
      city: "Jersey City, New Jersey",
      date: isoIn(12),
      guests: 60,
      budget: 600,
      currency: "USD",
      vibes: ["Volunteer day", "Potluck", "Block party"],
      feeling: "Useful first, festive second",
      mustHaves: "A morning litter cleanup, then a potluck on the closed street.",
      constraints: "Wheelchair access on the route. Flyers in English, Spanish, and Bengali. No open flame.",
      notes: "The block association has a borrowed speaker. Confirm whether the permit already includes insurance.",
    },
    headline: "Saturday tools, then lunch in the street",
    concept:
      "Riverside Avenue gets a morning cleanup and a potluck, in that order. Sixty neighbors is the hope, not a ticket count. The $600 buys the permit gap, bags, water, a few serving pieces, and flyers in the three languages people on the block actually read.\n\nTwelve days is too late for a perfect poster campaign, which is why one task is already late and still worth doing. The route stays on the smooth sidewalk so a wheelchair can finish it. The potluck is cold and covered. Nobody lights a grill.",
    watchout: "Do not assume the permit includes insurance. Ask the clerk and write down the answer.",
    contingency: 60,
    budgetLines: [
      line("c1", "Permit", 75, "Block permit. Insurance only if the clerk says it is not included.", "essential", 75),
      line("c2", "Bags, gloves, grabbers", 130, "Enough tools that the first hour is not people waiting.", "essential", 0),
      line("c3", "Water and first aid", 80, "A jug station and a small kit at the accessible end of the route.", "essential", 0),
      line("c4", "Potluck serving gear", 150, "Tables borrowed, a few hotel pans and labels bought.", "flexible", 0),
      line("c5", "Flyers in three languages", 70, "English, Spanish, and Bengali, posted where people already stop.", "flexible", 0),
      line("c6", "Speaker batteries", 35, "The speaker is borrowed. The batteries are not.", "flexible", 0),
    ],
    timeline: [
      mile("c1", 21, "3 weeks before", "Confirm the permit in person", "Ask, out loud, whether insurance is included. This one is already late.", false),
      mile("c2", 10, "10 days before", "Print the flyers", "English, Spanish, and Bengali on one sheet, with the wheelchair route drawn.", false),
      mile("c3", 7, "1 week before", "Borrow tables", "Place them where a wheelchair can reach the water, not the curb cut's far side.", false),
      mile("c4", 3, "3 days before", "Text the volunteers", "Name who holds the first-aid kit and who watches the nut and allergy labels.", false),
      mile("c5", 1, "Day before", "Fill the jugs", "Cold water. No sterno, no grill, no open flame.", false),
      mile("c6", 0, "Event day", "Cleanup, then potluck", "Tools from 9 to 12. Lunch in the street at 12:30.", false),
      mile("c7", -1, "The day after", "Tell the block where the trash went", "A short note in the same three languages.", false),
    ],
    vendors: [
      vendor(
        "c1",
        "Permit desk",
        "Without this, the street is not yours at lunch.",
        "Immediately",
        "$75, already paid. Insurance is the open question.",
        ["Does this permit include insurance, yes or no?", "If it rains, is the date transferable?"],
        "booked",
      ),
      vendor(
        "c2",
        "Sanitation",
        "Sixty people and a cleanup produce a pile. Know where it goes.",
        "This week",
        "Ask before you rent a dumpster you may not need.",
        ["Where do volunteer bag drops go on a Saturday?", "Is there a bulk pickup if the pile is larger than household trash?"],
        "researching",
      ),
      vendor(
        "c3",
        "Printer",
        "A flyer nobody can read is decoration.",
        "10 days before",
        "About $70.",
        ["Can you set English, Spanish, and Bengali on one half-page?", "What is the fastest turnaround if we bring the file Thursday?"],
        "not_started",
      ),
      vendor(
        "c4",
        "Volunteer lead for first aid",
        "A neighbor, not a service contract.",
        "3 days before",
        "The $80 kit stays with one named person.",
        ["Who stays at the accessible end of the route with the kit?", "Where is the nearest open pharmacy that morning?"],
        "not_started",
      ),
    ],
    ideas: [
      idea("c1", "activity", "Sidewalk loop, not the gutter", "The Riverside route stays on the smooth sidewalk so a wheelchair can finish with the group."),
      idea("c2", "menu", "Covered potluck, no flame", "Neighbors bring cold dishes. Labels in English, Spanish, and Bengali. No grill."),
      idea("c3", "decor", "The flyers are the bunting", "String the extra prints between the borrowed tables instead of buying decorations."),
      idea("c4", "moment", "Tools down at noon", "A borrowed speaker, one song, then lunch. The morning was the point."),
      idea("c5", "favor", "A spare pair of gloves", "Anyone who stays for lunch leaves with gloves for the next Saturday, not a souvenir."),
      idea("c6", "theme", "Useful, then festive", "The block looks cared for before anyone eats. That is the whole aesthetic."),
    ],
    chat: [],
  };
}

function line(
  id: string,
  category: string,
  planned: number,
  note: string,
  priority: BudgetLine["priority"],
  spent: number,
): BudgetLine {
  return { id: `bud_${id}`, category, planned, spent, note, priority };
}

function mile(id: string, offsetDays: number, whenLabel: string, title: string, detail: string, done: boolean): Milestone {
  return { id: `mile_${id}`, offsetDays, whenLabel, title, detail, done };
}

function vendor(
  id: string,
  category: string,
  why: string,
  bookBy: string,
  budgetHint: string,
  questions: string[],
  status: Vendor["status"],
): Vendor {
  return { id: `ven_${id}`, category, why, bookBy, budgetHint, questions, status };
}

function idea(id: string, kind: Idea["kind"], title: string, detail: string, pinned = false): Idea {
  return { id: `idea_${id}`, kind, title, detail, pinned };
}
