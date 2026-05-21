import { prisma } from "./prismaClient";

export type AuditAction =
  // Auth
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_REGISTERED"
  // Products
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED"
  // Categories
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED"
  | "CATEGORY_DELETED"
  // Sales
  | "SALE_COMPLETED"
  | "SALE_REFUNDED"
  | "SALE_HELD"
  // Customers
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CUSTOMER_DELETED"
  // Suppliers
  | "SUPPLIER_CREATED"
  | "SUPPLIER_UPDATED"
  // Purchase Orders
  | "PURCHASE_ORDER_CREATED"
  | "PURCHASE_ORDER_RECEIVED"
  // Users
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DEACTIVATED"
  | "USER_ACTIVATED"
  // Stores
  | "STORE_CREATED"
  | "STORE_UPDATED"
  | "STORE_DEACTIVATED"
  // Inventory
  | "INVENTORY_ADJUSTED"
  // Settings
  | "SETTINGS_UPDATED"
  | "SUBSCRIPTION_CHANGED";

export interface AuditContext {
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  actorEmail?: string;
  organizationId: string;
  storeId?: string;
  storeName?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditEntry {
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  resourceLabel?: string;
  metadata?: Record<string, unknown>;
  context: AuditContext;
}

/**
 * Write an audit log entry to the database.
 * Fire-and-forget — never throws, so it never breaks the main flow.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.context.actorId ?? null,
        actorName: entry.context.actorName ?? null,
        actorRole: entry.context.actorRole ?? null,
        actorEmail: entry.context.actorEmail ?? null,
        action: entry.action,
        resourceType: entry.resourceType ?? null,
        resourceId: entry.resourceId ?? null,
        resourceLabel: entry.resourceLabel ?? null,
        organizationId: entry.context.organizationId,
        storeId: entry.context.storeId ?? null,
        storeName: entry.context.storeName ?? null,
        metadata: entry.metadata as any,
        ipAddress: entry.context.ipAddress ?? null,
        userAgent: entry.context.userAgent ?? null,
      },
    });
  } catch (err) {
    // Audit logging must NEVER break the primary operation
    console.warn("[AuditLog] Failed to write audit log:", err);
  }
}

/**
 * Extract actor context from a request + user record.
 */
export function buildAuditContext(
  request: Request,
  user: { id: string; name?: string | null; role: string; email?: string | null; organizationId?: string | null },
  extras?: { storeId?: string; storeName?: string }
): AuditContext {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const ua = request.headers.get("user-agent") ?? undefined;

  return {
    actorId: user.id,
    actorName: user.name ?? undefined,
    actorRole: user.role,
    actorEmail: user.email ?? undefined,
    organizationId: user.organizationId ?? "unknown",
    storeId: extras?.storeId,
    storeName: extras?.storeName,
    ipAddress: ip,
    userAgent: ua,
  };
}
