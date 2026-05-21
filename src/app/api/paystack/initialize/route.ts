import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prismaClient";
import { requireAuth, isNextResponse } from "../../../../utils/apiAuth";

// Paystack plan amounts in kobo (GHS pesewas × 100)
// GHS 29 → 2900, GHS 79 → 7900, GHS 199 → 19900
const PLAN_AMOUNTS: Record<string, number> = {
  starter:    2900,
  pro:        7900,
  enterprise: 19900,
};

// Paystack plan codes (set these in your Paystack dashboard, then add to .env)
const PLAN_CODES: Record<string, string> = {
  starter:    process.env.PAYSTACK_STARTER_PLAN_CODE    || "",
  pro:        process.env.PAYSTACK_PRO_PLAN_CODE         || "",
  enterprise: process.env.PAYSTACK_ENTERPRISE_PLAN_CODE || "",
};

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;

    const { plan } = await req.json();

    if (!PLAN_AMOUNTS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { organizationId: true, email: true, name: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Initialize Paystack transaction
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: PLAN_AMOUNTS[plan],          // in pesewas (GHS × 100)
        currency: "GHS",
        plan: PLAN_CODES[plan] || undefined,  // links to a recurring plan if set
        callback_url: `${appUrl}/dashboard?billing=success`,
        metadata: {
          organizationId: user.organizationId,
          plan,
          userName: user.name,
          cancel_action: `${appUrl}/dashboard`,
        },
      }),
    });

    const psData = await paystackRes.json();

    if (!psData.status || !psData.data?.authorization_url) {
      console.error("Paystack init error:", psData);
      return NextResponse.json(
        { error: psData.message || "Paystack initialization failed" },
        { status: 500 }
      );
    }

    // Store the Paystack customer code immediately for future reference
    await prisma.subscription.updateMany({
      where: { organizationId: user.organizationId },
      data: { paystackCustomerCode: user.email }, // email is Paystack's customer identifier
    });

    return NextResponse.json({ url: psData.data.authorization_url });
  } catch (error: any) {
    console.error("Paystack initialize error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
