import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prismaClient";
import bcrypt from "bcryptjs";

import { writeAuditLog } from "../../../../utils/auditLogger";

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

export async function POST(req: Request) {
  try {
    const { name, email, password, orgName, plan, storeName, storeLocation, currency } = await req.json();

    if (!name || !email || !password || !orgName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check for existing email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const selectedPlan = plan || "starter";

    // Generate unique slug
    let baseSlug = slugify(orgName);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: { name: orgName, slug, ownerEmail: email },
      });

      // 2. Create Subscription (trialing)
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          plan: selectedPlan,
          status: "trialing",
          trialEnd,
        },
      });

      // 3. Create the owner User
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "super_admin",
          status: "active",
          organizationId: org.id,
        },
      });

      // 4. Create the first Store
      const store = await tx.store.create({
        data: {
          name: storeName || `${orgName} Store`,
          location: storeLocation || "Main Branch",
          currency: currency || "GHS",
          taxRate: 0,
          status: "active",
          organizationId: org.id,
        },
      });

      // 5. Link user to the store
      await tx.user.update({
        where: { id: user.id },
        data: { storeId: store.id },
      });

      return { user, store, org };
    });

    // Write audit log for new registration
    writeAuditLog({
      action: "USER_REGISTERED",
      resourceType: "Organization",
      resourceId: result.org.id,
      resourceLabel: result.org.name,
      metadata: { plan: selectedPlan, storeName: result.store.name },
      context: {
        actorId: result.user.id,
        actorName: result.user.name,
        actorRole: result.user.role,
        actorEmail: result.user.email,
        organizationId: result.org.id,
        storeId: result.store.id,
        storeName: result.store.name,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });

    return NextResponse.json({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      status: result.user.status,
      storeId: result.store.id,
      organizationId: result.org.id,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
