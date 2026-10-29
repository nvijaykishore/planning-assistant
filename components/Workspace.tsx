"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { envelope } from "../lib/budget";
import { KIND_META } from "../lib/catalog";
import { daysLabel, formatDay, money, perGuest, slug } from "../lib/format";
import { getSample } from "../lib/samples";
import { deletePlan, loadPlan, savePlan } from "../lib/storage";
import type { Plan } from "../lib/types";
import { AskDrawer } from "./AskDrawer";
import { BudgetPanel } from "./BudgetPanel";
import { IdeasPanel } from "./IdeasPanel";
import { Shell } from "./Shell";
import { TimelinePanel } from "./TimelinePanel";
import { VendorPanel } from "./VendorPanel";

const TABS = [
  ["overview", "Overview"],
  ["budget", "Budget"],
  ["timeline", "Timeline"],
  ["vendors", "Vendors"],
  ["ideas", "Ideas"],
] as const;

type Tab = (typeof TABS)[number][0];

export function Workspace({ id }: { id: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    const found = loadPlan(id);
    if (found) {
      setPlan(found);
      setMissing(false);
      return;
    }
    const sample = getSample(id);
    if (sample) {
      savePlan(sample);
      setPlan(sample);
      setMissing(false);
      return;
    }
    setMissing(true);
  }, [id]);

  useEffect(() => {
    if (plan) document.title = `${plan.headline} · Daybook`;
  }, [plan]);

  function commit(next: Plan) {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    setPlan(stamped);
    savePlan(stamped);
  }

  if (missing) {
    return (
      <Shell>
        <h1>This plan is not in this browser.</h1>
        <p>Daybook keeps plans on this device. The worked examples are still on the front page.</p>
        <Link href="/">Back to Daybook</Link>
      </Shell>
    );
  }

  if (!plan) {
    return (
      <Shell>
        <p className="quiet">Opening the plan…</p>
      </Shell>
    );
  }

  const booked = plan.vendors.filter((vendor) => vendor.status === "booked").length;
  const spent = plan.budgetLines.reduce((sum, line) => sum + line.spent, 0);
  const nextUp = plan.timeline.filter((item) => !item.done).slice(0, 3);

  return (
    <Shell
      trailing={
        <>
          <Link href={`/plan/new?plan=${plan.id}`}>Edit brief</Link>
          <button type="button" className="text-btn" onClick={() => download(plan)}>Export</button>
          <button type="button" className="text-btn" onClick={() => window.print()}>Print</button>
          {plan.origin === "sample" ? (
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                const fresh = getSample(plan.id);
                if (fresh) commit(fresh);
              }}
            >
              Restore example
            </button>
          ) : null}
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              if (!window.confirm("Delete this plan from this browser?")) return;
              deletePlan(plan.id);
              router.push("/");
            }}
          >
            Delete
          </button>
        </>
      }
    >
      <p className="kicker">
        {KIND_META[plan.brief.kind].label}
        {plan.origin === "sample" ? " · Example" : ""} · {plan.brief.honorees}
      </p>
      <h1>{plan.headline}</h1>
      <p className="quiet">
        {plan.brief.city} · {formatDay(plan.brief.date)} · {plan.brief.guests} guests
      </p>
      <dl className="stats" data-kind={plan.brief.kind}>
        <div>
          <dt className="kicker">Budget</dt>
          <dd>{money(plan.brief.budget, plan.brief.currency)}</dd>
        </div>
        <div>
          <dt className="kicker">Per guest</dt>
          <dd>{money(perGuest(plan.brief.budget, plan.brief.guests), plan.brief.currency)}</dd>
        </div>
        <div>
          <dt className="kicker">When</dt>
          <dd>{daysLabel(plan.brief.date)}</dd>
        </div>
        <div>
          <dt className="kicker">Vendors booked</dt>
          <dd>{booked} of {plan.vendors.length}</dd>
        </div>
      </dl>

      <div className="actions no-print">
        <button type="button" className="btn" data-testid="ask-daybook" onClick={() => setAskOpen(true)}>
          Ask Daybook
        </button>
      </div>

      <div className="tabs" role="tablist" aria-label="Plan sections">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`tab-${key}`}
            data-testid={`tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`panel-${key}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="panel-overview" role="tabpanel" hidden={tab !== "overview"} aria-labelledby="tab-overview">
        <section className="panel">
          <div className="split">
            <div>
              {plan.concept.split(/\n\n+/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {plan.watchout ? <p className="watchout">{plan.watchout}</p> : null}
            </div>
            <div>
              <p className="kicker">Next</p>
              {nextUp.length === 0 ? <p>The timeline is clear.</p> : null}
              <ul className="questions">
                {nextUp.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong> · {item.whenLabel}
                  </li>
                ))}
              </ul>
              <p className="quiet">{money(spent, plan.brief.currency)} marked spent. Ledger total {money(envelope(plan.budgetLines, plan.contingency), plan.brief.currency)}.</p>
            </div>
          </div>
        </section>
      </div>
      <div id="panel-budget" role="tabpanel" hidden={tab !== "budget"} aria-labelledby="tab-budget">
        <BudgetPanel plan={plan} onChange={commit} />
      </div>
      <div id="panel-timeline" role="tabpanel" hidden={tab !== "timeline"} aria-labelledby="tab-timeline">
        <TimelinePanel plan={plan} onChange={commit} />
      </div>
      <div id="panel-vendors" role="tabpanel" hidden={tab !== "vendors"} aria-labelledby="tab-vendors">
        <VendorPanel plan={plan} onChange={commit} />
      </div>
      <div id="panel-ideas" role="tabpanel" hidden={tab !== "ideas"} aria-labelledby="tab-ideas">
        <IdeasPanel plan={plan} onChange={commit} />
      </div>

      <AskDrawer plan={plan} open={askOpen} onClose={() => setAskOpen(false)} onApply={commit} />
    </Shell>
  );
}

function download(plan: Plan) {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug(plan.headline)}.daybook.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
