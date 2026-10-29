import { publicError, VisibleFailure } from "./failures";

export async function readJson(request: Request, unreadable: string): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new VisibleFailure(400, unreadable);
  }
}

export async function jsonResult(label: string, run: () => Promise<unknown>): Promise<Response> {
  try {
    return Response.json(await run());
  } catch (error) {
    const mapped = publicError(error);
    console.error(label, mapped.status, mapped.message);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}
