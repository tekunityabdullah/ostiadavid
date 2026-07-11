import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  try {
    const { email, userId, paymentMethodId } = (await request.json()) as {
      email?: string;
      userId?: string;
      paymentMethodId?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stripe = getStripe();
    const configuredPrice = process.env.STRIPE_EXCLUSIVE_PRICE_ID;

    const priceId = configuredPrice || await createPrice(stripe);

    let customer;
    const existingCustomers = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: normalizedEmail,
        metadata: {
          purpose: "exclusive_membership",
          user_id: user?.id ?? userId ?? "",
        },
      });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: {
        purpose: "exclusive_membership",
        email: normalizedEmail,
        user_id: user?.id ?? userId ?? "",
      },
    });

    await supabase
      .from("profiles")
      .update({
        account_type: "exclusive",
        stripe_customer_id: customer.id,
      })
      .eq("id", user?.id ?? userId ?? "");

    return NextResponse.json({ success: true, subscriptionId: subscription.id });
  } catch (err) {
    console.error("Exclusive checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create subscription." },
      { status: 500 }
    );
  }
}

async function createPrice(stripe: Stripe): Promise<string> {
  const product = await stripe.products.create({
    name: "Osita David Exclusive Membership",
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: "usd",
    recurring: { interval: "month" },
  });

  return price.id;
}
