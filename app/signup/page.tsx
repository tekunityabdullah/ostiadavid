"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (authError) {
      setLoginError(authError.message);
      setLoginLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");

    // Password validation
    if (signupPassword.length < 8) {
      setSignupError("Password must be at least 8 characters");
      setSignupLoading(false);
      return;
    }
    if (!/\d/.test(signupPassword)) {
      setSignupError("Password must contain a number");
      setSignupLoading(false);
      return;
    }
    if (!/[a-z]/.test(signupPassword) || !/[A-Z]/.test(signupPassword)) {
      setSignupError("Password must contain both upper & lowercase characters");
      setSignupLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      setSignupError(authError.message);
      setSignupLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
      });
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setSignupSuccess(true);
    setSignupLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
          {/* Sign In Section */}
          <div className="border border-white/30 p-6 sm:p-8 flex flex-col">
            <h2 className="text-base text-[12px] sm:text-lg md:text-xl font-medium uppercase tracking-wide mb-6">
              Sign In To Your Existing Account
            </h2>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 flex-1">
              <div>
                <label className="block text-xs uppercase tracking-tight text-white/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-white/30 text-white text-[12px] outline-none  placeholder:text-white/40 placeholder:text-xs"
                  placeholder="ENTER YOUR EMAIL"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-tight text-white/70 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 pr-12 py-3 bg-transparent border border-white/30 text-white text-xs outline-none  placeholder:text-white/40 placeholder:text-xs"
                    placeholder="ENTER YOUR PASSWORD"
                  />

                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showLoginPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-300">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-4 px-8 py-3 text-xs uppercase tracking-tight font-medium text-black bg-white border-none cursor-pointer transition-colors duration-200 hover:bg-[#e5e5e5] disabled:opacity-50"
              >
                {loginLoading ? "Signing In..." : "Sign In"}
              </button>

              <Link
                href="#"
                className="text-[10px] text-white/50 hover:text-white transition-colors uppercase"
              >
                Forgot Your Password?
              </Link>
            </form>

            <div className="mt-auto pt-6">
              <Link
                href="/"
                className="text-[10px] text-white/50 hover:text-white transition-colors uppercase"
              >
                Return To Store
              </Link>
            </div>
          </div>

          {/* Create Account Section */}
          <div className="border border-white/30 p-6 sm:p-8 flex flex-col">
            <h2 className="text-base text-[12px] sm:text-lg md:text-xl font-medium uppercase tracking-wide mb-6">
              Create Account
            </h2>

            {signupSuccess ? (
              <div className="flex flex-col gap-4 flex-1 items-center justify-center">
                <p className="text-sm text-white/70 text-center">
                  Check your email to confirm your account, then log in.
                </p>
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-tight text-white hover:opacity-70"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSignup}
                className="flex flex-col gap-4 flex-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-tight text-white/70 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-white/30 text-white text-xs outline-none  placeholder:text-white/40 placeholder:text-xs"
                      placeholder="FIRST NAME"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-tight text-white/70 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-white/30 text-white text-xs outline-none  placeholder:text-white/40 placeholder:text-xs"
                      placeholder="LAST NAME"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-tight text-white/70 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-white/30 text-white text-xs outline-none  placeholder:text-white/40 placeholder:text-xs"
                    placeholder="ENTER YOUR EMAIL"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-tight text-white/70 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full px-4 pr-12 py-3 bg-transparent border border-white/30 text-white text-xs outline-none  placeholder:text-white/40 placeholder:text-xs"
                      placeholder="CREATE A PASSWORD"
                    />

                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showSignupPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <p className="text-[10px] text-white/50 uppercase">
                    • Password must be at least 8 characters
                  </p>
                  <p className="text-[10px] text-white/50 uppercase">
                    • Password must contain a number
                  </p>
                  <p className="text-[10px] text-white/50 uppercase">
                    • Password must contain both upper & lowercase characters
                  </p>
                </div>

                {signupError && (
                  <p className="text-xs text-red-300">{signupError}</p>
                )}

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="mt-4 px-8 py-3 text-xs uppercase tracking-tight font-medium text-black bg-white border-none cursor-pointer transition-colors duration-200 hover:bg-[#e5e5e5] disabled:opacity-50"
                >
                  {signupLoading ? "Creating..." : "Create"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
