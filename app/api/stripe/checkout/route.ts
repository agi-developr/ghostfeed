import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

const PLANS: Record<string, { priceId: string; name: string }> = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    name: "Starter",
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: "Pro",
  },
  agency: {
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    name: "Agency",
  },
};

export async function POST(request: Request) {
  const { plan, email } = await request.json();

  if (!PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/#pricing`,
      metadata: { plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Checkout failed", message: err.message },
      { status: 500 },
    );
  }
}
