import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../utils/prismaClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-10-28.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { organizationId, plan } = session.metadata || {};
        if (!organizationId || !plan) break;
        const subId = session.subscription as string;
        const stripeSub = await stripe.subscriptions.retrieve(subId) as any;
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            plan,
            status: "active",
            stripeSubscriptionId: subId,
            stripePriceId: stripeSub.items?.data[0]?.price?.id,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
        });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: sub.status as string,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: { status: "canceled" },
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data: { status: "past_due" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
