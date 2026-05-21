import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prismaClient";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "../../../../utils/auditLogger";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Audit — fire and forget
    if (user.organizationId) {
      writeAuditLog({
        action: "USER_LOGIN",
        resourceType: "User",
        resourceId: user.id,
        resourceLabel: user.name,
        context: {
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          actorEmail: user.email,
          organizationId: user.organizationId,
          ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      });
    }

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
