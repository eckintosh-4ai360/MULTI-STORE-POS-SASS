import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";
import bcrypt from "bcryptjs";
import { requireAuth, isNextResponse } from "../../../utils/apiAuth";
import { writeAuditLog, buildAuditContext } from "../../../utils/auditLogger";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;
    if (!["super_admin", "store_admin"].includes(auth.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await req.json();
    const password = data.password || "password123";
    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status || "active",
        storeId: data.storeId || null,
        organizationId: data.organizationId || null,
        passwordHash,
      },
    });

    // Audit
    const actor = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, role: true, email: true, organizationId: true } });
    if (actor?.organizationId) {
      writeAuditLog({
        action: "USER_CREATED",
        resourceType: "User",
        resourceId: newUser.id,
        resourceLabel: newUser.name,
        metadata: { role: newUser.role, email: newUser.email, storeId: newUser.storeId },
        context: buildAuditContext(req, actor),
      });
    }

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;
    if (!["super_admin", "store_admin"].includes(auth.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await req.json();
    const { id, password, ...updateData } = data;

    const updatePayload: Record<string, unknown> = { ...updateData };
    if (password) {
      updatePayload.passwordHash = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatePayload,
    });

    // Determine action from status change or general update
    const actor = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, role: true, email: true, organizationId: true } });
    if (actor?.organizationId) {
      const action = updateData.status === "inactive"
        ? "USER_DEACTIVATED"
        : updateData.status === "active"
        ? "USER_ACTIVATED"
        : "USER_UPDATED";
      writeAuditLog({
        action,
        resourceType: "User",
        resourceId: updatedUser.id,
        resourceLabel: updatedUser.name,
        metadata: { role: updatedUser.role, status: updatedUser.status },
        context: buildAuditContext(req, actor),
      });
    }

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
