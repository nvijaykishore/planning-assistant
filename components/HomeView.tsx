"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KIND_META } from "../lib/catalog";
import { formatDay, money } from "../lib/format";
import { listPlans } from "../lib/storage";
import type { EventKind, Plan } from "../lib/types";
import { Shell } from "./Shell";

const KINDS: EventKind[] = ["wedding", "birthday", "community"];

export function HomeView() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  useEffect(() => {
    setPlans(listPlans());
  }, []);

  return (
    <Shell>
      <section className="hero">
        <h1>Write the day down before it arrives.</h1>
        <p className="lede">
          A planning studio for weddings, birthdays, and community gatherings. You bring the people, the place, and the number.
          Daybook writes a budget that adds up, a timeline, a vendor checklist, and ideas that fit this event.
        </p>
      </section>

      <section className="kinds" aria-label="Start a plan">
        {KINDS.map((kind) => (
          <Link key={kind} className="kind" data-kind={kind} data-testid={`kind-${kind}`} href={`/plan/new?kind=${kind}`}>
            <span className="num">{KIND_META[kind].numeral}</span>
            <h2>{KIND_META[kind].label}</h2>
            <p>{KIND_META[kind].line}</p>
          </Link>
        ))}
      </section>

      <section className="section">
        <h2>Worked examples</h2>
        <p className="quiet">Open one to see a budget, a timeline, and a vendor list already in motion. Edits stay in this browser.</p>
        <ul className="example-list">
          <li>
            <Link href="/plan/sample-wedding" data-testid="open-sample-wedding">
              <span className="kicker">Wedding · $42,000</span>
              <span className="row-title">Priya and Jonah, orchard tent</span>
            </Link>
          </li>
          <li>
            <Link href="/plan/sample-birthday" data-testid="open-sample-birthday">
              <span className="kicker">Birthday · $1,800</span>
              <span className="row-title">Mateo turns 7 in a Brooklyn yard</span>
            </Link>
          </li>
          <li>
            <Link href="/plan/sample-community" data-testid="open-sample-community">
              <span className="kicker">Community · $600</span>
              <span className="row-title">Riverside Avenue cleanup and potluck</span>
            </Link>
          </li>
        </ul>
        <p>
          <Link href="/plan/new?kind=birthday&demo=1">Or start from a filled birthday brief and let Grok write a new one.</Link>
        </p>
      </section>

      {plans && plans.length > 0 ? (
        <section className="section">
          <h2>In this browser</h2>
          <ul className="plan-list">
            {plans.map((plan) => (
              <li key={plan.id}>
                <Link href={`/plan/${plan.id}`}>
                  <span className="kicker">
                    {KIND_META[plan.brief.kind].label}
                    {plan.origin === "sample" ? " · Example" : ""} · {formatDay(plan.brief.date)}
                  </span>
                  <span className="row-title">{plan.headline}</span>
                  <span className="quiet">
                    {plan.brief.city} · {money(plan.brief.budget, plan.brief.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Shell>
  );
}
