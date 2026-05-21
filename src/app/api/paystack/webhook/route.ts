import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prismaClient";

/**
 * Paystack webhook handler.
 *
 * Paystack sends a "x-paystack-signature" header (HMAC-SHA512 of the raw body
 * using your secret key). We verify it before processing any event.
 *
 * Relevant events we handle:
 *  - charge.success          → mark subscription active after one-time or first recurring payment
 *  - subscription.create     → recurring plan was created
 *  - subscription.disable    → recurring plan was cancelled
 *  - invoice.payment_failed  → payment failed for a recurring charge
 */

import crypto from "crypto";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const data = event.data;

    switch (event.event) {
      // ── Successful payment (one-time or recurring) ──────────────────────────
      case "charge.success": {
        const meta = data.metadata || {};
        const { organizationId, plan } = meta;
        if (!organizationId || !plan) break;

        // Paystack subscription_code comes through on recurring charges
        const subscriptionCode = data.subscription_code || null;
        const nextPaymentDate = data.paid_at
          ? new Date(new Date(data.paid_at).setMonth(new Date(data.paid_at).getMonth() + 1))
          : null;

        await prisma.subscription.updateMany({
          where: { organizationId },
          data: {
            plan,
            status: "active",
            paystackSubscriptionCode: subscriptionCode,
            paystackCustomerCode: data.customer?.customer_code || data.customer?.email || null,
            currentPeriodEnd: nextPaymentDate,
          },
        });
        break;
      }

      // ── Recurring plan created ───────────────────────────────────────────────
      case "subscription.create": {
        const customerCode = data.customer?.customer_code || null;
        if (!customerCode) break;

        await prisma.subscription.updateMany({
          where: { paystackCustomerCode: customerCode },
          data: {
            status: "active",
            paystackSubscriptionCode: data.subscription_code || null,
            currentPeriodEnd: data.next_payment_date ? new Date(data.next_payment_date) : null,
          },
        });
        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────────────
      case "subscription.disable": {
        const subscriptionCode = data.subscription_code;
        if (!subscriptionCode) break;

        await prisma.subscription.updateMany({
          where: { paystackSubscriptionCode: subscriptionCode },
          data: { status: "canceled" },
        });
        break;
      }

      // ── Payment failed ───────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const subscriptionCode = data.subscription?.subscription_code;
        if (!subscriptionCode) break;

        await prisma.subscription.updateMany({
          where: { paystackSubscriptionCode: subscriptionCode },
          data: { status: "past_due" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Paystack webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
