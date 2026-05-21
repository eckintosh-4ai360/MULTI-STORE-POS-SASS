import { NextResponse } from "next/server";
import { prisma } from "./prismaClient";

/**
 * Simple session token validator for API routes.
 * Checks the X-User-Id header (set by the client after login).
 * Returns the user object if valid, or a 401 NextResponse if not.
 */
export async function requireAuth(
  request: Request
): Promise<{ userId: string; role: string } | NextResponse> {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    });

    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return { userId: user.id, role: user.role };
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export function isNextResponse(val: unknown): val is NextResponse {
  return val instanceof NextResponse;
}
