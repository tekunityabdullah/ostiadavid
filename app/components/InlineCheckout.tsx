"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { formatPrice } from "@/lib/utils";
import type { CartItem, ShippingAddress } from "@/lib/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const EMPTY_ADDRESS: ShippingAddress = {
  name: "",
  address1: "",
  address2: "",
  city: "",
  stateCode: "",
  countryCode: "US",
  zip: "",
  phone: "",
};

interface InlineCheckoutProps {
  items: CartItem[];
  onSuccess: () => void;
  submitLabel?: string;
}

function InlineCheckoutForm({ items, onSuccess, submitLabel = "PAY" }: InlineCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);

  function updateAddress(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  const addressComplete =
    address.name.trim() !== "" &&
    address.address1.trim() !== "" &&
    address.city.trim() !== "" &&
    address.stateCode.trim() !== "" &&
    address.countryCode.trim() !== "" &&
    address.zip.trim() !== "";

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal > 0 ? 8.0 : 0;
  const total = subtotal + shipping;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    if (!addressComplete) {
      setError("PLEASE FILL IN YOUR FULL SHIPPING ADDRESS.");
      return;
    }

    setCheckingOut(true);
    setError("");

    if (!stripe || !elements) {
      setError("PAYMENT SYSTEM NOT LOADED.");
      setCheckingOut(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("CARD ELEMENT NOT FOUND.");
      setCheckingOut(false);
      return;
    }

    const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (paymentError) {
      setError(paymentError.message || "PAYMENT FAILED.");
      setCheckingOut(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, paymentMethodId: paymentMethod.id, shippingAddress: address }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout failed");
        setCheckingOut(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
      setCheckingOut(false);
    }
  }

  return (
    <form onSubmit={handleCheckout}>
      <div className="border border-white/20 p-6 flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-tight font-medium text-white">
          Order Summary
        </h2>

        <div className="flex justify-between text-sm text-white/70">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/70">
          <span>Shipping</span>
          <span>{formatPrice(shipping)}</span>
        </div>

        <div className="border-t border-white/10 pt-4 flex justify-between text-base font-medium text-white">
          <span className="uppercase tracking-tight">Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <h3 className="text-sm uppercase tracking-tight text-white/70">
            SHIPPING ADDRESS
          </h3>
          <input
            type="text"
            placeholder="Full name"
            value={address.name}
            onChange={(e) => updateAddress("name", e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none placeholder:text-white/40"
            autoComplete="name"
          />
          <input
            type="text"
            placeholder="Address line 1"
            value={address.address1}
            onChange={(e) => updateAddress("address1", e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none placeholder:text-white/40"
            autoComplete="address-line1"
          />
          <input
            type="text"
            placeholder="Address line 2 (optional)"
            value={address.address2}
            onChange={(e) => updateAddress("address2", e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none placeholder:text-white/40"
            autoComplete="address-line2"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="City"
              value={address.city}
              onChange={(e) => updateAddress("city", e.target.value)}
              className="w-1/2 px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none placeholder:text-white/40"
              autoComplete="address-level2"
            />
            <input
              type="text"
              placeholder="State"
              value={address.stateCode}
              onChange={(e) => updateAddress("stateCode", e.target.value)}
              className="w-1/4 px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none placeholder:text-white/40"
              autoComplete="address-level1"
            />
            <input
              type="text"
              placeholder="ZIP"
              value={address.zip}
              onChange={(e) => updateAddress("zip", e.target.value)}
              className="w-1/4 px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none placeholder:text-white/40"
              autoComplete="postal-code"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Country code (e.g. US)"
              value={address.countryCode}
              onChange={(e) => updateAddress("countryCode", e.target.value.toUpperCase())}
              maxLength={2}
              className="w-1/2 px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none placeholder:text-white/40"
              autoComplete="country"
            />
            <input
              type="text"
              placeholder="Phone (optional)"
              value={address.phone}
              onChange={(e) => updateAddress("phone", e.target.value)}
              className="w-1/2 px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none placeholder:text-white/40"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <h3 className="text-sm uppercase tracking-tight text-white/70">
            PAYMENT
          </h3>
          <div className="w-full px-4 py-3 bg-transparent border border-white/20 text-white text-sm outline-none">
            <CardElement
              options={{
                style: {
                  base: {
                    color: "#ffffff",
                    fontSize: "14px",
                    "::placeholder": {
                      color: "rgba(255, 255, 255, 0.4)",
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-300 text-center">{error}</p>
        )}

        <button
          disabled={checkingOut || !addressComplete}
          className="w-full mt-2 px-8 py-3 text-xs uppercase tracking-tight font-medium text-black bg-white border-none cursor-pointer transition-colors duration-200 hover:bg-[#e5e5e5] active:scale-95 disabled:opacity-50"
          type="submit"
        >
          {checkingOut ? "PROCESSING..." : `${submitLabel} ${formatPrice(total)}`}
        </button>
      </div>
    </form>
  );
}

export default function InlineCheckout(props: InlineCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <InlineCheckoutForm {...props} />
    </Elements>
  );
}
