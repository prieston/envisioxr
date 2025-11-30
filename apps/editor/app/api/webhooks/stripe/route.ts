import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST: Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const isNewOrganization =
          session.metadata?.isNewOrganization === "true";

        if (isNewOrganization) {
          // Create new organization after payment
          const userId = session.metadata?.userId;
          const orgName = session.metadata?.orgName;
          const orgSlug = session.metadata?.orgSlug;
          const planCode = session.metadata?.planCode;

          if (!userId || !orgName || !orgSlug || !planCode) {
            console.error(
              "[Stripe Webhook] Missing metadata for new organization creation"
            );
            break;
          }

          // Create organization
          const organization = await prisma.organization.create({
            data: {
              name: orgName,
              slug: orgSlug,
              isPersonal: false,
              planCode: planCode,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionStatus: "active",
            },
          });

          // Add user as owner
          await prisma.organizationMember.create({
            data: {
              organizationId: organization.id,
              userId: userId,
              role: "owner",
            },
          });
        } else {
          // Update existing organization with subscription details
          const organizationId = session.metadata?.organizationId;
          const planCode = session.metadata?.planCode;

          if (!organizationId || !planCode) {
            console.error(
              "[Stripe Webhook] Missing metadata in checkout.session.completed"
            );
            break;
          }

          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              planCode: planCode,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionStatus: "active",
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const organization = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (organization) {
          await prisma.organization.update({
            where: { id: organization.id },
            data: {
              subscriptionStatus: subscription.status,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organization = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (organization) {
          // Downgrade to free plan
          await prisma.organization.update({
            where: { id: organization.id },
            data: {
              planCode: "free",
              subscriptionStatus: "canceled",
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing webhook:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
