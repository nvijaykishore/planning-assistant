import { envelope, rebalanceToTarget } from "../lib/budget";
import { dollars, money } from "../lib/format";
import type { Plan } from "../lib/types";

const BANDS = ["#7a3148", "#c44924", "#8d6414", "#24574a", "#3d4f73", "#6b5344", "#8a4b3c", "#4e6759", "#5c4d6e"];

export function BudgetPanel({ plan, onChange }: { plan: Plan; onChange: (plan: Plan) => void }) {
  const total = envelope(plan.budgetLines, plan.contingency);
  const spent = plan.budgetLines.reduce((sum, line) => sum + (Number(line.spent) || 0), 0);
  const variance = total - plan.brief.budget;
  const widthOf = (amount: number) => (plan.brief.budget > 0 ? `${Math.max(0, (amount / plan.brief.budget) * 100)}%` : "0%");

  function update(id: string, partial: Partial<Plan["budgetLines"][number]>) {
    onChange({
      ...plan,
      budgetLines: plan.budgetLines.map((line) => (line.id === id ? { ...line, ...partial } : line)),
    });
  }

  return (
    <section className="panel" aria-labelledby="budget-heading">
      <h2 id="budget-heading">Budget</h2>
      <p className="quiet">
        Estimates, not quotes. {money(spent, plan.brief.currency)} spent of {money(plan.brief.budget, plan.brief.currency)}.
        {variance === 0
          ? " Lines plus contingency match the brief."
          : ` The ledger is ${money(Math.abs(variance), plan.brief.currency)} ${variance > 0 ? "over" : "under"}.`}
      </p>
      <div className="bar" aria-hidden="true">
        {plan.budgetLines.map((line, index) => (
          <i key={line.id} style={{ width: widthOf(line.planned), background: BANDS[index % BANDS.length] }} />
        ))}
        <i style={{ width: widthOf(plan.contingency), background: "#cfc6b8" }} />
      </div>
      <div className="actions no-print" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            const scaled = rebalanceToTarget(plan.budgetLines, plan.contingency, plan.brief.budget);
            onChange({ ...plan, budgetLines: scaled.lines, contingency: scaled.contingency });
          }}
        >
          Rebalance flexible lines
        </button>
      </div>
      <table className="ledger">
        <thead>
          <tr>
            <th>Category</th>
            <th>Note</th>
            <th className="num">Planned</th>
            <th className="num">Spent</th>
          </tr>
        </thead>
        <tbody>
          {plan.budgetLines.map((line) => (
            <tr key={line.id}>
              <td data-label="Category">
                <strong>{line.category}</strong>
                <div>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => update(line.id, { priority: line.priority === "essential" ? "flexible" : "essential" })}
                  >
                    {line.priority === "essential" ? "Essential" : "Flexible"}
                  </button>
                </div>
              </td>
              <td data-label="Note">{line.note}</td>
              <td className="num" data-label="Planned">
                <input
                  type="number"
                  min={0}
                  aria-label={`Planned for ${line.category}`}
                  value={line.planned}
                  onChange={(event) => update(line.id, { planned: dollars(event.target.value) })}
                />
              </td>
              <td className="num" data-label="Spent">
                <input
                  type="number"
                  min={0}
                  aria-label={`Spent on ${line.category}`}
                  value={line.spent}
                  onChange={(event) => update(line.id, { spent: dollars(event.target.value) })}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td data-label="Category">Contingency</td>
            <td data-label="Note">Held back for the thing you cannot see yet.</td>
            <td className="num" data-label="Planned">{money(plan.contingency, plan.brief.currency)}</td>
            <td data-label="Spent" />
          </tr>
          <tr className="total-row">
            <td data-label="Category">Total</td>
            <td data-label="Note" />
            <td className="num" data-label="Planned">{money(total, plan.brief.currency)}</td>
            <td className="num" data-label="Spent">{money(spent, plan.brief.currency)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
