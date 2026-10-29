/** A failure whose message is already safe to show. */
export class VisibleFailure extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "VisibleFailure";
    this.status = status;
  }
}

/** The model returned a plan that failed a shape check. The message names the gap. */
export class PlanShapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanShapeError";
  }
}

export const UNFINISHED = "Grok could not finish that. Your work is still here — try once more.";

export function publicError(error: unknown): { status: number; message: string } {
  if (error instanceof VisibleFailure) return { status: error.status, message: error.message };
  if (error instanceof PlanShapeError) return { status: 502, message: `${error.message} Try once more.` };
  return { status: 502, message: UNFINISHED };
}
