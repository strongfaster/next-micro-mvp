import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

function getSubscriptionPeriodEnd(sub: Record<string, unknown>): Date {
  const end = (sub as { current_period_end?: number }).current_period_end;
  return end ? new Date(end * 1000) : new Date();
}

function getSubscriptionFromInvoice(invoice: Record<string, unknown>): string | null {
  const sub = (invoice as { subscription?: string | null }).subscription;
  return sub || null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as unknown as Record<string, unknown> & { id: string; items: { data: { price: { id: string } }[] } };

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
            status: "active",
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
            status: "active",
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = getSubscriptionFromInvoice(invoice as unknown as Record<string, unknown>);

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Record<string, unknown> & { items: { data: { price: { id: string } }[] } };

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
            status: "active",
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "canceled" },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as unknown as Record<string, unknown> & Stripe.Subscription;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription as unknown as Record<string, unknown>),
            status: subscription.status === "active" ? "active" : "inactive",
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
