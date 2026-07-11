import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import type { CartItem, ShippingAddress } from "@/lib/types";
import { printfulAPI } from "@/lib/printful";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function isValidShippingAddress(address: unknown): address is ShippingAddress {
  if (!address || typeof address !== "object") return false;
  const a = address as Record<string, unknown>;
  return (
    typeof a.name === "string" && a.name.trim() !== "" &&
    typeof a.address1 === "string" && a.address1.trim() !== "" &&
    typeof a.city === "string" && a.city.trim() !== "" &&
    typeof a.stateCode === "string" && a.stateCode.trim() !== "" &&
    typeof a.countryCode === "string" && a.countryCode.trim() !== "" &&
    typeof a.zip === "string" && a.zip.trim() !== ""
  );
}

async function createPrintfulOrderIfNeeded(
  items: CartItem[],
  user: any,
  shippingAddress: ShippingAddress
) {
  if (!printfulAPI) return;

  try {
    const supabase = await createClient();

    // Check which items are Printful products
    const printfulItems = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("printful_id, printful_variant_id")
        .eq("id", item.productId)
        .single();

      if (!product?.printful_id) continue;

      // Prefer the exact size/color the customer chose on the product page;
      // fall back to the product's default variant if none was selected.
      const syncVariantId = item.variantId ?? product.printful_variant_id;
      if (!syncVariantId) continue;

      console.log("Printful Debug:", {
  productId: item.productId,
  variantId: item.variantId,
  defaultVariantId: product.printful_variant_id,
  syncVariantId,
});

      printfulItems.push({
        quantity: item.quantity,
        sync_variant_id: syncVariantId,
        retail_price: item.price,
      });
    }

    if (printfulItems.length === 0) return;

    // Create order on Printful using the address collected at checkout
    const order = await printfulAPI.createOrder({
  shipping: "STANDARD",
  recipient: {
    name: shippingAddress.name,
    email: user?.email || "customer@example.com",
    address1: shippingAddress.address1,
    address2: shippingAddress.address2 || null,
    city: shippingAddress.city,
    state_code: shippingAddress.stateCode,
    country_code: shippingAddress.countryCode,
    zip: shippingAddress.zip,
    phone: shippingAddress.phone || null,
  },
  items: printfulItems,
});

console.log("========== PRINTFUL RESPONSE ==========");
console.log(JSON.stringify(order, null, 2));
console.log("=======================================");
  } catch (error) {
    console.error("Failed to create Printful order:", error);
    // Don't fail the checkout if Printful order fails
  }
}

export async function POST(request: Request) {
  try { 
    const { items, paymentMethodId, shippingAddress } = (await request.json()) as {
      items?: CartItem[];
      paymentMethodId?: string;
      shippingAddress?: ShippingAddress;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (paymentMethodId && !isValidShippingAddress(shippingAddress)) {
      return NextResponse.json(
        { error: "A complete shipping address is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stripe = getStripe();

    // Calculate total amount in cents
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 8.0;
    const total = (subtotal + shipping) * 100; // Convert to cents

    // Create or get customer
    let customer;
    if (user?.email) {
      const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id },
        });
      }
    }

    if (paymentMethodId && customer) {
      // Inline payment flow - process payment directly
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
      await stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      // Create payment intent
     const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(total),
  currency: "usd",
  customer: customer.id,
  payment_method: paymentMethodId,
  confirm: true,

  automatic_payment_methods: {
    enabled: true,
    allow_redirects: "never",
  },

  metadata: {
    user_id: user?.id ?? "",
    cart_items: JSON.stringify(
      items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }))
    ),
  },
});

      if (paymentIntent.status === "succeeded") {
        // Check if any items are Printful products and create order
        await createPrintfulOrderIfNeeded(items, user, shippingAddress as ShippingAddress);

        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: "Payment failed" }, { status: 400 });
      }
    } else {
      // Fallback to checkout session for non-logged-in users or if paymentMethodId not provided
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
        (item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })
      );

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: 800,
        },
        quantity: 1,
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${appUrl}/cart?success=true`,
        cancel_url: `${appUrl}/cart?canceled=true`,
        customer_email: user?.email ?? undefined,
        customer: customer?.id,
        metadata: {
          user_id: user?.id ?? "",
          cart_items: JSON.stringify(
            items.map((i) => ({
              productId: i.productId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
            }))
          ),
        },
      });

      return NextResponse.json({ url: session.url });
    }
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
