"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const NAV = [
  { href: "/", label: "Peta Realtime", code: "01" },
  { href: "/laporan", label: "Laporan Warga", code: "02" },
  { href: "/bank-sampah", label: "Bank Sampah", code: "03" },
  { href: "/zona", label: "Zona & Jam Kerja", code: "04" },
  { href: "/akun", label: "Akun Pengguna", code: "05" },
  { href: "/statistik", label: "Statistik", code: "06" },
  { href: "/notifikasi", label: "Broadcast", code: "07" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-64 shrink-0 bg-panel border-r border-line flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-line">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-signal pulse-dot text-signal" />
          <span className="font-data text-[10px] tracking-widest text-muted uppercase">
            live
          </span>
        </div>
        <h1 className="font-display font-semibold text-lg leading-tight">SMART META</h1>
        <p className="text-xs text-muted mt-0.5">Kel. Teladan Barat</p>
      </div>

      <nav className="flex-1 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition border-l-2 ${
                active
                  ? "border-signal text-ink bg-base/40"
                  : "border-transparent text-muted hover:text-ink hover:bg-base/20"
              }`}
            >
              <span className="font-data text-[10px] text-muted">{item.code}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-line">
        <button
          onClick={logout}
          className="text-xs text-muted hover:text-danger transition"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
