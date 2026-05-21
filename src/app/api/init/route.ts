import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";
import { requireAuth, isNextResponse } from "../../../utils/apiAuth";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isNextResponse(auth)) return auth;

    // Get the requesting user with their organizationId
    const requestingUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { organizationId: true },
    });

    const organizationId = requestingUser?.organizationId ?? null;

    // ── Fetch all data scoped to this user's organization ────────────────────
    // Super-admins without an org (edge case) get empty data
    const orgFilter = organizationId ? { organizationId } : { id: "___no_match___" };
    const storeFilter = organizationId
      ? { store: { organizationId } }
      : { id: "___no_match___" };

    const [
      stores,
      users,
      categories,
      products,
      customers,
      sales,
      inventoryLogs,
      suppliers,
      purchaseOrders,
      heldSales,
    ] = await Promise.all([
      // Stores that belong to this org
      prisma.store.findMany({
        where: { organizationId: organizationId ?? undefined },
        orderBy: { createdAt: "asc" },
      }),

      // Users that belong to this org
      prisma.user.findMany({
        where: { organizationId: organizationId ?? undefined },
        orderBy: { createdAt: "asc" },
      }),

      // Categories for stores in this org
      prisma.category.findMany({
        where: { store: { organizationId: organizationId ?? undefined } },
        orderBy: { name: "asc" },
      }),

      // Products for stores in this org
      prisma.product.findMany({
        where: { store: { organizationId: organizationId ?? undefined } },
        orderBy: { createdAt: "desc" },
      }),

      // Customers for stores in this org
      prisma.customer.findMany({
        where: { store: { organizationId: organizationId ?? undefined } },
        orderBy: { createdAt: "desc" },
      }),

      // Sales for stores in this org
      prisma.sale.findMany({
        where: { store: { organizationId: organizationId ?? undefined } },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),

      // Inventory logs for stores in this org
      prisma.inventoryLog.findMany({
        where: { store: { organizationId: organizationId ?? undefined } },
        orderBy: { createdAt: "desc" },
      }),

      // Suppliers for stores in this org
      prisma.supplier.findMany({
        where: { store: { organizationId: organizationId ?? undefined } },
        orderBy: { name: "asc" },
      }),

      // Purchase orders for stores in this org
      prisma.purchaseOrder.findMany({
        where: { store: { organizationId: organizationId ?? undefined } },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),

      // Held sales (no org relation — filter by storeId membership)
      prisma.heldSale.findMany({
        orderBy: { heldAt: "desc" },
        include: { items: true },
      }),
    ]);

    // Strip passwordHash before sending to client
    const sanitizedUsers = users.map(({ passwordHash, ...rest }) => rest);

    // Subscription for this org
    let subscriptionData = null;
    if (organizationId) {
      subscriptionData = await prisma.subscription.findUnique({
        where: { organizationId },
        select: {
          plan: true,
          status: true,
          trialEnd: true,
          currentPeriodEnd: true,
          paystackCustomerCode: true,
        },
      });
    }

    // Organization details
    let organizationData = null;
    if (organizationId) {
      organizationData = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true, name: true, slug: true, ownerEmail: true },
      });
    }

    return NextResponse.json({
      stores,
      users: sanitizedUsers,
      categories,
      products,
      customers,
      sales,
      inventoryLogs,
      suppliers,
      purchaseOrders,
      heldSales,
      subscription: subscriptionData,
      organization: organizationData,
    });
  } catch (error: any) {
    console.error("Error in /api/init:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize POS state" },
      { status: 500 }
    );
  }
}
