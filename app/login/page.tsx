"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPostLoginRedirect } from "@/lib/getPostLoginRedirect";
import Footer from "../components/Footer";
import BackgroundClipVideo from "../components/BackgroundClipVideo";
import { Eye, EyeOff } from "lucide-react";


export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("PLEASE ENTER EMAIL AND PASSWORD");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // A hard navigation here — not router.push()/refresh() — matters:
    // right after an auth change, Next's client-side router cache can
    // still serve a page rendered for whoever was logged in before (or
    // logged out), which is exactly how a regular account could
    // momentarily/persistently see Exclusive content or vice versa. A full
    // reload guarantees the next page is rendered fresh against the new
    // session, no stale cache involved.
    window.location.href = await getPostLoginRedirect(supabase);
  }

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <BackgroundClipVideo
        desktopSrc="/exclusive-looped-clip-desktop.mp4"
        mobileSrc="/exclusive-looped-clip-mobile.mp4"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/10" />

      {/* CONTENT */}
      <div className="relative z-20 min-h-[100svh] flex flex-col">
        {/* SIGN UP / EXIT - TOP OF SCREEN */}
        <div className="pt-8 px-6 flex items-center justify-center gap-6">
          <a
            href="/signup/exclusive"
            className="text-[10px] font-light text-white uppercase transition-colors hover:opacity-70"
          >
            JOIN
          </a>
          <a
            href="/"
            className="text-[10px] font-light text-white uppercase transition-colors hover:opacity-70"
          >
            EXIT
          </a>
        </div>

        {/* CENTER AREA */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-[340px] flex flex-col items-center">
            {/* EMAIL */}
            <input
              type="email"
              placeholder="EMAIL"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border-0 border-b border-black/30 text-white text-center text-[10px] font-sans outline-none transition-colors duration-200 focus:border-white placeholder:text-white/40 placeholder:text-xs"
            />


            {/* PASSWORD */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-transparent border-0 border-b border-black/30 text-white text-center text-[10px] font-sans outline-none transition-colors duration-200 focus:border-white placeholder:text-white/40 placeholder:text-xs"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="mt-4 text-xs text-red-300 text-center">{error}</p>
            )}

            {/* ENTER BUTTON */}
            <button
              disabled={loading}
              onClick={handleLogin}
              className="
          mt-5  text-white uppercase
          text-[10px] font-light hover:opacity-60
          transition-opacity disabled:opacity-30 cursor-pointer
        "
            >
              {loading ? "ENTERING..." : "ENTER"}
            </button>
          </div>
        </div>

        {/* FOOTER — now perfectly responsive */}
        <div className="pb-6 px-4">
          <Footer />
        </div>
      </div>
    </section>
  );
}