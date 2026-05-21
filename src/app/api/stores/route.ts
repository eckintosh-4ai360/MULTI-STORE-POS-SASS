import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";
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
    const newStore = await prisma.store.create({
      data: {
        name: data.name,
        location: data.location,
        currency: data.currency,
        taxRate: data.taxRate,
        status: data.status || "active",
        logo: data.logo || null,
        receiptHeader: data.receiptHeader || null,
        receiptFooter: data.receiptFooter || null,
        organizationId: data.organizationId || null,
      },
    });

    // Audit
    const actor = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, role: true, email: true, organizationId: true } });
    if (actor?.organizationId) {
      writeAuditLog({
        action: "STORE_CREATED",
        resourceType: "Store",
        resourceId: newStore.id,
        resourceLabel: newStore.name,
        metadata: { location: newStore.location, currency: newStore.currency },
        context: buildAuditContext(req, actor, { storeId: newStore.id, storeName: newStore.name }),
      });
    }

    return NextResponse.json(newStore);
  } catch (error: unknown) {
    console.error("Error creating store:", error);
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
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
    const { id, ...updateData } = data;
    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData,
    });

    // Audit
    const actor = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, role: true, email: true, organizationId: true } });
    if (actor?.organizationId) {
      const action = updateData.status === "inactive" ? "STORE_DEACTIVATED" : "STORE_UPDATED";
      writeAuditLog({
        action,
        resourceType: "Store",
        resourceId: updatedStore.id,
        resourceLabel: updatedStore.name,
        metadata: { location: updatedStore.location, status: updatedStore.status },
        context: buildAuditContext(req, actor, { storeId: updatedStore.id, storeName: updatedStore.name }),
      });
    }

    return NextResponse.json(updatedStore);
  } catch (error: unknown) {
    console.error("Error updating store:", error);
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
  }
}
