export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 },
    );
  }

  const supabase = createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const plan = session.metadata?.plan || "starter";
      const email = session.customer_email;

      if (email) {
        // Upsert subscription record — look up user by email via auth admin
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find((u) => u.email === email);

        if (user) {
          await supabase.from("subscriptions").upsert({
            user_id: user.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            videos_this_month: 0,
            period_start: new Date().toISOString(),
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ plan: "free" })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // Reset monthly video count on renewal
      if (invoice.billing_reason === "subscription_cycle") {
        // New Stripe API: subscription is nested under parent
        const subId =
          typeof invoice.parent?.subscription_details?.subscription === "string"
            ? invoice.parent.subscription_details.subscription
            : (invoice.parent?.subscription_details?.subscription as Stripe.Subscription | null)?.id;

        if (subId) {
          await supabase
            .from("subscriptions")
            .update({
              videos_this_month: 0,
              period_start: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
