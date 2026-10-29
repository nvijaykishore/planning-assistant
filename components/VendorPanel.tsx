import type { Plan, VendorStatus } from "../lib/types";

const LABELS: Record<VendorStatus, string> = {
  not_started: "Not started",
  researching: "Researching",
  contacted: "Contacted",
  booked: "Booked",
  skipped: "Skipped",
};

export function VendorPanel({ plan, onChange }: { plan: Plan; onChange: (plan: Plan) => void }) {
  return (
    <section className="panel" aria-labelledby="vendor-heading">
      <h2 id="vendor-heading">Vendors</h2>
      <p className="quiet">Roles, not brand names. The questions are the part worth keeping.</p>
      {plan.vendors.map((vendor) => (
        <article key={vendor.id} className="vendor">
          <div className="vendor-head">
            <h3>{vendor.category}</h3>
            <label>
              <span className="kicker">Status</span>
              <select
                aria-label={`Status for ${vendor.category}`}
                value={vendor.status}
                onChange={(event) =>
                  onChange({
                    ...plan,
                    vendors: plan.vendors.map((item) =>
                      item.id === vendor.id ? { ...item, status: event.target.value as VendorStatus } : item,
                    ),
                  })
                }
              >
                {(Object.keys(LABELS) as VendorStatus[]).map((status) => (
                  <option key={status} value={status}>{LABELS[status]}</option>
                ))}
              </select>
            </label>
          </div>
          <p>{vendor.why}</p>
          <p className="quiet">Book by {vendor.bookBy}. {vendor.budgetHint}</p>
          <ul className="questions">
            {vendor.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
