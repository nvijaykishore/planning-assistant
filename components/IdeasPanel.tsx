"use client";

import { useState } from "react";
import type { IdeaKind, Plan } from "../lib/types";

const FILTERS: Array<IdeaKind | "all" | "pinned"> = ["all", "pinned", "theme", "menu", "activity", "decor", "favor", "moment"];

export function IdeasPanel({ plan, onChange }: { plan: Plan; onChange: (plan: Plan) => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const visible = plan.ideas.filter((idea) => {
    if (filter === "all") return true;
    if (filter === "pinned") return idea.pinned;
    return idea.kind === filter;
  });

  return (
    <section className="panel" aria-labelledby="ideas-heading">
      <h2 id="ideas-heading">Ideas</h2>
      <p className="quiet">Pinned ideas stay pinned when you ask for a revision.</p>
      <div className="filters" role="toolbar" aria-label="Filter ideas">
        {FILTERS.map((item) => (
          <button key={item} type="button" className="chip" aria-pressed={filter === item} onClick={() => setFilter(item)}>
            {item === "all" ? "All" : item === "pinned" ? "Pinned" : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      {visible.length === 0 ? <p>Nothing in this filter yet.</p> : null}
      {visible.map((idea) => (
        <article key={idea.id} className="idea">
          <div className="idea-head">
            <div>
              <span className="kicker">{idea.kind}</span>
              <h3>{idea.title}</h3>
            </div>
            <button
              type="button"
              className="btn secondary"
              aria-pressed={idea.pinned}
              onClick={() =>
                onChange({
                  ...plan,
                  ideas: plan.ideas.map((item) => (item.id === idea.id ? { ...item, pinned: !item.pinned } : item)),
                })
              }
            >
              {idea.pinned ? "Pinned" : "Pin"}
            </button>
          </div>
          <p>{idea.detail}</p>
        </article>
      ))}
    </section>
  );
}
