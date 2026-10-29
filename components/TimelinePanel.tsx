import { daysUntil } from "../lib/format";
import type { Plan } from "../lib/types";

export function TimelinePanel({ plan, onChange }: { plan: Plan; onChange: (plan: Plan) => void }) {
  const days = daysUntil(plan.brief.date);
  return (
    <section className="panel" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading">Timeline</h2>
      <p className="quiet">Check off what is done. It stays checked if you ask Daybook to revise the plan.</p>
      <ol className="rail">
        {plan.timeline.map((item) => {
          const overdue = days !== null && !item.done && item.offsetDays > days;
          return (
            <li key={item.id} className={item.done ? "done" : undefined}>
              <input
                type="checkbox"
                checked={item.done}
                aria-label={`Mark done: ${item.title}`}
                onChange={() =>
                  onChange({
                    ...plan,
                    timeline: plan.timeline.map((milestone) =>
                      milestone.id === item.id ? { ...milestone, done: !milestone.done } : milestone,
                    ),
                  })
                }
              />
              <div>
                <span className="kicker">{item.whenLabel}</span>
                {overdue ? <span className="flag"> Overdue</span> : null}
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
