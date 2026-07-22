import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { sendDigitalDownloadEmail } from "@/lib/digital-delivery";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (
          session.mode === "subscription" &&
          session.metadata?.purpose === "exclusive_membership"
        ) {
          await upgradeExclusiveFromSession(session, supabase);
        }

        if (session.mode === "payment" && session.metadata?.cart_items) {
          const cartItems = JSON.parse(session.metadata.cart_items) as Array<{
            productId: string;
            name: string;
            price: number;
            quantity: number;
            isDigital?: boolean;
          }>;

          const total = (session.amount_total ?? 0) / 100;
          const userId = session.metadata.user_id || null;

          const { data: order } = await supabase
            .from("orders")
            .insert({
              user_id: userId || null,
              stripe_session_id: session.id,
              total,
              status: "paid",
            })
            .select("id")
            .single();

          if (order) {
            await supabase.from("order_items").insert(
              cartItems.map((item) => ({
                order_id: order.id,
                product_id: item.productId,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
              }))
            );
          }

          const recipientEmail = session.customer_details?.email ?? session.customer_email;
          await sendDigitalDownloadEmail(recipientEmail, cartItems);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.status === "active" || subscription.status === "trialing") {
          await upgradeUserByStripeCustomer(subscription.customer as string, supabase);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await downgradeUserByStripeCustomer(subscription.customer as string, supabase);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer && invoice.billing_reason === "subscription_create") {
          await upgradeUserByStripeCustomer(invoice.customer as string, supabase);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upgradeUserByStripeCustomer(
  customerId: string,
  supabase: Awaited<ReturnType<typeof createServiceClient>>
) {
  const customer = await getStripe().customers.retrieve(customerId);
  if (customer.deleted || !("email" in customer) || !customer.email) return;

  const email = customer.email;

  const { data: profile } = await supabase
    .from("profiles")
    .update({
      account_type: "exclusive",
      stripe_customer_id: customerId,
    })
    .eq("email", email)
    .select("id")
    .single();

  if (!profile) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users.find((u) => u.email === email);
    if (user) {
      await supabase
        .from("profiles")
        .update({
          account_type: "exclusive",
          stripe_customer_id: customerId,
        })
        .eq("id", user.id);
    }
  }
}

async function upgradeExclusiveFromSession(
  session: Stripe.Checkout.Session,
  supabase: Awaited<ReturnType<typeof createServiceClient>>
) {
  const customerId =
    typeof session.customer === "string" ? session.customer : null;
  const userId = session.metadata?.user_id;
  const email = session.metadata?.email || session.customer_details?.email;

  if (userId) {
    await supabase
      .from("profiles")
      .update({
        account_type: "exclusive",
        stripe_customer_id: customerId,
      })
      .eq("id", userId);
    return;
  }

  if (email) {
    await supabase
      .from("profiles")
      .update({
        account_type: "exclusive",
        stripe_customer_id: customerId,
      })
      .eq("email", email);
  }
}

async function downgradeUserByStripeCustomer(
  customerId: string,
  supabase: Awaited<ReturnType<typeof createServiceClient>>
) {
  await supabase
    .from("profiles")
    .update({ account_type: "regular" })
    .eq("stripe_customer_id", customerId);
}
