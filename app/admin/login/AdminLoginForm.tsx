"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

interface AdminLoginFormProps {
  initialError?: string;
}

export default function AdminLoginForm({ initialError = "" }: AdminLoginFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!adminPassword) {
      setError("Admin password not configured.");
      setLoading(false);
      return;
    }

    if (password !== adminPassword) {
      setError("Invalid admin password.");
      setLoading(false);
      return;
    }

    // Set admin session in localStorage
    localStorage.setItem("adminSession", "true");
    localStorage.setItem("adminTimestamp", Date.now().toString());

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
          type="password"
          placeholder="ADMIN PASSWORD"
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
        {loading ? "Checking..." : "Enter Admin"}
      </button>
    </form>
  );
}
