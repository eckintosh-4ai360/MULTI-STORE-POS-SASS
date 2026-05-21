import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";
import { requireAuth, isNextResponse } from "../../../utils/apiAuth";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isNextResponse(auth)) return auth;

    // Only super_admin and store_admin can access audit logs
    if (!["super_admin", "store_admin"].includes(auth.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the user's org
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { organizationId: true },
    });
    if (!user?.organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
    const action = searchParams.get("action") ?? undefined;
    const actorId = searchParams.get("actorId") ?? undefined;
    const resourceType = searchParams.get("resourceType") ?? undefined;
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const where = {
      organizationId: user.organizationId,
      ...(action ? { action } : {}),
      ...(actorId ? { actorId } : {}),
      ...(resourceType ? { resourceType } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, limit });
  } catch (error: unknown) {
    console.error("Audit logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
