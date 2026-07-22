"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminLoginFormProps {
  initialError?: string;
}

export default function AdminLoginForm({ initialError = "" }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // proxy.ts middleware verifies admins-table membership on the way in —
    // a non-admin account will be bounced back to "/" from here.
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="grid w-full max-w-[380px] gap-6">
      <div className="grid gap-3 text-center">
        <div className="mx-auto flex size-11 items-center justify-center border border-white/20">
          <LockKeyhole size={18} />
        </div>
        <h1 className="text-2xl font-medium uppercase tracking-tight">
          Admin Login
        </h1>
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">
          Product dashboard access
        </p>
      </div>

      <div className="grid gap-4">
        <input
          type="email"
          placeholder="EMAIL"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full border border-white/20 bg-black px-4 text-center text-sm text-white outline-none placeholder:text-white/35 focus:border-white"
        />
        <input
          type="password"
          placeholder="PASSWORD"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full border border-white/20 bg-black px-4 text-center text-sm text-white outline-none placeholder:text-white/35 focus:border-white"
        />
      </div>

      {error && <p className="text-center text-xs text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center border border-white bg-white px-5 text-xs font-medium uppercase tracking-[0.22em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Enter Admin"}
      </button>
    </form>
  );
}
