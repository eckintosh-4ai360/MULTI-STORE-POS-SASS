import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../utils/prismaClient";
import { requireAuth, isNextResponse } from "../../../../utils/apiAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-10-28.acacia" as any,
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
