"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email atau kata sandi salah.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-signal pulse-dot text-signal" />
          <span className="font-data text-xs tracking-widest text-muted uppercase">
            Live Ops · Teladan Barat
          </span>
        </div>
        <h1 className="font-display text-3xl font-semibold mb-1">SMART META</h1>
        <p className="text-muted text-sm mb-8">
          Masuk ke pusat kendali pemantauan petugas kebersihan.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-panel border border-line rounded-md px-3 py-2.5 text-ink outline-none focus:border-signal transition"
              placeholder="admin@teladanbarat.go.id"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted mb-1">
              Kata sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-panel border border-line rounded-md px-3 py-2.5 text-ink outline-none focus:border-signal transition"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal text-base font-semibold rounded-md py-2.5 hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
