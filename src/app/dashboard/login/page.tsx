"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      if (res.status === 401) {
        setError("Invalid password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gradient-to-br from-velvet via-nearblack to-deepblack px-4 text-offwhite">
      <div className="glass gold-glow w-full max-w-sm rounded-3xl p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/leisure-logo.png"
            alt="Leisure"
            width={148}
            height={44}
            priority
            className="h-10 w-auto"
          />
          <p className="font-pinyon mt-4 text-3xl text-gold">Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-wide text-offwhite/60"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-offwhite outline-none focus:border-gold"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold mt-2 w-full disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
