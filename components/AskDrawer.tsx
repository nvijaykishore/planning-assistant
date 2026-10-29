"use client";

import { useEffect, useRef, useState } from "react";
import { PROMPTS } from "../lib/catalog";
import { applyRevision, readRawPlan } from "../lib/normalize";
import type { Plan } from "../lib/types";

export function AskDrawer({
  plan,
  open,
  onClose,
  onApply,
}: {
  plan: Plan;
  open: boolean;
  onClose: () => void;
  onApply: (plan: Plan) => void;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  async function send(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 2 || pending) return;
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, plan }),
        signal: AbortSignal.timeout(70_000),
      });
      const data = (await response.json()) as { error?: string; plan?: unknown; reply?: string; budgetTotal?: number };
      if (!response.ok) throw new Error(data.error || "Daybook could not revise the plan.");
      const next = applyRevision(plan, readRawPlan(data.plan), Number(data.budgetTotal), trimmed, data.reply || "Updated.");
      onApply(next);
      setMessage("");
    } catch (caught) {
      const timedOut = caught instanceof DOMException && (caught.name === "TimeoutError" || caught.name === "AbortError");
      setError(timedOut ? "Grok took too long. The plan is unchanged." : caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button className="backdrop" type="button" aria-label="Close Ask Daybook" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-labelledby="ask-heading">
        <header>
          <h2 id="ask-heading">Ask Daybook</h2>
          <button type="button" className="text-btn" onClick={onClose}>Close</button>
        </header>
        <div className="thread">
          {plan.chat.length === 0 ? (
            <p className="quiet">Ask to trim the budget, move a date, or add a rain plan. Checkmarks and money already spent stay put.</p>
          ) : null}
          {plan.chat.map((turn, index) => (
            <p key={`${turn.role}-${index}`} className={turn.role === "user" ? "bubble user" : "bubble"}>
              {turn.content}
            </p>
          ))}
          {error ? <p className="alert" role="alert">{error}</p> : null}
          <div className="suggest">
            {PROMPTS[plan.brief.kind].map((prompt) => (
              <button key={prompt} type="button" className="chip" disabled={pending} onClick={() => send(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(message);
          }}
        >
          <label className="field">
            <span className="lbl">Revision</span>
            <textarea
              ref={field}
              value={message}
              maxLength={1000}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Cut 15% without touching the meal."
            />
          </label>
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Rewriting…" : "Revise the plan"}
          </button>
        </form>
      </aside>
    </>
  );
}
