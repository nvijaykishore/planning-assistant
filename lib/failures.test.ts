import assert from "node:assert/strict";
import test from "node:test";
import { PlanShapeError, publicError, VisibleFailure } from "./failures";

test("publicError returns a visible failure unchanged", () => {
  assert.deepEqual(publicError(new VisibleFailure(400, "Say what you want changed.")), {
    status: 400,
    message: "Say what you want changed.",
  });
});

test("publicError asks for another try when a plan is too thin", () => {
  const mapped = publicError(new PlanShapeError("The budget came back too thin to use."));
  assert.equal(mapped.status, 502);
  assert.match(mapped.message, /budget/i);
  assert.match(mapped.message, /Try once more/);
});

test("publicError hides an unexpected failure", () => {
  const mapped = publicError(new Error("socket hang up near sk-secret"));
  assert.equal(mapped.status, 502);
  assert.equal(mapped.message.includes("sk-secret"), false);
});
