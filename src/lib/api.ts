import { NextResponse } from "next/server";
import { formatZodError, profileSchema } from "./schema";
import type { Profile } from "./types";

export function jsonError(status: number, message: string, details?: Record<string, string>) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** Accepts either `{ profile: {...} }` or the profile fields at the top level. */
export function parseProfile(body: unknown): { profile: Profile } | { error: NextResponse } {
  const raw = body && typeof body === "object" && "profile" in body ? (body as { profile: unknown }).profile : body;
  const result = profileSchema.safeParse(raw);
  if (!result.success) {
    return { error: jsonError(422, "Nieprawidłowe dane profilu", formatZodError(result.error)) };
  }
  return { profile: result.data as Profile };
}
