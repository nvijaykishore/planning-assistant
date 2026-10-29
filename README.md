# Daybook

Daybook is a planning studio for weddings, birthdays, and community events.

You write a brief. Grok (`grok-4.7` on the xAI API) writes a plan that belongs to that brief: a concept, a budget, a timeline, a vendor checklist, and a handful of ideas. Daybook then keeps the budget honest, and keeps your checkmarks.

## Principles

- The budget is a sum, not a mood. Line items plus contingency equal the number you named. If the model misses, Daybook rescales the lines and shows the variance.
- Ideas have to carry a detail from the brief. A peanut allergy, a sailcloth tent, a block permit.
- The model does not invent vendor brands or claim a venue is free. Figures are estimates, not quotes.
- Plans live in the browser. The API call sets `store: false`, so the brief is not kept as a stored model conversation.
- The API key stays on the server.

## Run

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `XAI_API_KEY`.
3. `npm run dev`

Worked examples open without a key. Writing a new plan, or asking Daybook to revise one, needs the key.

## Check

- `npm test` checks that budgets hit their target and that worked examples still add up.
- `npm run build` produces the production build.
