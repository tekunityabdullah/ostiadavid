"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { createClient } from "@/lib/supabase/client";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { Eye, EyeOff } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function SignupForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stripeError, setStripeError] = useState("");

  // Check if Stripe is loaded
  React.useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeError(
        "STRIPE KEY NOT CONFIGURED. PLEASE ADD NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY TO .ENV",
      );
    }
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!stripe || !elements) {
      setError("PAYMENT SYSTEM NOT LOADED.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user && fullName) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
      });
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("CARD ELEMENT NOT FOUND.");
      setLoading(false);
      return;
    }

    const { error: paymentError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: fullName,
          email: normalizedEmail,
          address: {
            postal_code: zipCode,
          },
        },
      });

    if (paymentError) {
      setError(paymentError.message || "PAYMENT FAILED.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/exclusive-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        userId: data.user?.id ?? "",
        paymentMethodId: paymentMethod.id,
      }),
    });

    const checkout = (await response.json()) as {
      url?: string;
      error?: string;
    };

    if (!response.ok) {
      setError(checkout.error ?? "UNABLE TO COMPLETE CHECKOUT.");
      setLoading(false);
      return;
    }

    window.location.href = "/login?exclusive=success";
  }

  return (
    <form onSubmit={handleSignup} className="flex flex-col items-center gap-1">
      <input
        type="text"
        placeholder="FULL NAME"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full px-4 py-2 bg-transparent text-white text-[10px] outline-none text-center placeholder:text-white/40 placeholder:text-[10px]"
      />
      <input
        type="email"
        placeholder="EMAIL"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 bg-transparent text-white text-[10px] outline-none text-center placeholder:text-white/40 placeholder:text-[10px]"
      />
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="CREATE PASSWORD"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-transparent text-white text-[10px] outline-none text-center placeholder:text-white/40 placeholder:text-[10px]"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="w-full px-4 py-2 bg-transparent text-white text-[10px] outline-none text-center">
        {stripeError ? (
          <p className="text-[10px] text-red-300">{stripeError}</p>
        ) : (
          <CardElement
            options={{
              style: {
                base: {
                  color: "#ffffff",
                  fontSize: "10px",
                  "::placeholder": {
                    color: "rgba(255, 255, 255, 0.4)",
                  },
                },
              },
            }}
          />
        )}
      </div>
      <input
        type="text"
        placeholder="ZIP CODE"
        value={zipCode}
        onChange={(e) => setZipCode(e.target.value)}
        className="w-full px-4 py-2 bg-transparent text-white text-[10px] outline-none text-center placeholder:text-white/40 placeholder:text-[10px]"
      />

      {error && <p className="text-[10px] text-red-300 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-8 py-2 text-[10px] uppercase tracking-tight font-light text-white bg-transparent cursor-pointer disabled:opacity-50"
      >
        {loading ? "PROCESSING..." : "9.99"}
      </button>
    </form>
  );
}

export default function ExclusiveSignupPage() {
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const playVideo = async (video: HTMLVideoElement | null) => {
      if (!video) return;

      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;

      try {
        await video.play();
      } catch {
        // Browser blocked autoplay.
        // Nothing else can force autoplay if the browser refuses.
      }
    };

    playVideo(desktopVideoRef.current);
    playVideo(mobileVideoRef.current);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        playVideo(desktopVideoRef.current);
        playVideo(mobileVideoRef.current);
      }
    });
  }, []);
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      {/* DESKTOP VIDEO */}
      <video
        ref={desktopVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        poster="/poster.jpg"
        className="hidden sm:block absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      >
        <source src="/exclusive-looped-clip-desktop.mp4" type="video/mp4" />
      </video>

      {/* MOBILE VIDEO */}
      <video
        ref={mobileVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        poster="/poster.jpg"
        className="sm:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      >
        <source src="/exclusive-looped-clip-mobile.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/10" />

      {/* CONTENT */}
      <div className="relative z-20 min-h-[100svh] flex flex-col">
        {/* LOGIN LINK - TOP CENTER */}
        <div className="pt-8 px-6 text-center">
          <Link
            href="/login"
            className="text-white uppercase text-[10px] font-light transition-colors"
          >
            LOG IN
          </Link>
        </div>

        {/* CENTER AREA */}
        <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
          <div className="w-full max-w-md">
            <Elements stripe={stripePromise}>
              <SignupForm />
            </Elements>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pb-6 px-4">
          <Footer />
        </div>
      </div>
    </section>
  );
}
