import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../utils/prismaClient";
import { requireAuth, isNextResponse } from "../../../../utils/apiAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-10-28.acacia" as any,
});

const PRICE_IDS: Record<string, string> = {
  starter:    process.env.STRIPE_STARTER_PRICE_ID || "",
  pro:        process.env.STRIPE_PRO_PRICE_ID || "",
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
};

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;

    const { plan } = await req.json();
    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or Stripe not configured" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { organizationId: true, email: true, name: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let customerId = subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { organizationId: user.organizationId },
      });
      customerId = customer.id;
      if (subscription) {
        await prisma.subscription.update({
          where: { organizationId: user.organizationId },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?billing=success`,
      cancel_url: `${appUrl}/dashboard`,
      metadata: { organizationId: user.organizationId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
