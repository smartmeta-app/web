"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  Radar,
  ClipboardList,
  Users,
  BarChart3,
  Megaphone,
  LogOut,
  X,
} from "lucide-react";

const SECTIONS = [
  {
    label: "Pemantauan",
    items: [
      { href: "/", label: "Peta Realtime", icon: Radar, warna: "signal" as const },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/laporan", label: "Laporan Harian", icon: ClipboardList, warna: "melati" as const },
    ],
  },
  {
    label: "Kelola",
    items: [
      { href: "/akun", label: "Akun Pengguna", icon: Users, warna: "melati" as const },
      { href: "/statistik", label: "Statistik", icon: BarChart3, warna: "signal" as const },
      { href: "/notifikasi", label: "Broadcast", icon: Megaphone, warna: "signal" as const },
    ],
  },
];

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Overlay gelap di belakang drawer — cuma muncul di mobile saat terbuka */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          w-64 shrink-0 bg-panel border-r border-line flex flex-col min-h-screen relative
          fixed md:static inset-y-0 left-0 z-40
          transition-transform duration-200 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Aksen garis gradasi tipis di tepi kanan — biru ke hijau, senada logo */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-signal/50 via-melati/40 to-transparent" />

        <div className="px-5 py-6 border-b border-line relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #2F8AF0 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-smart-meta.jpg"
                alt="SMART META"
                className="w-10 h-10 rounded-lg object-cover border border-line shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-signal pulse-dot text-signal" />
                  <span className="font-data text-[10px] tracking-widest text-muted uppercase">
                    live · ops
                  </span>
                </div>
                <h1 className="font-display font-semibold text-lg leading-tight">
                  <span className="text-signal">SMART</span> <span className="text-melati">META</span>
                </h1>
                <p className="text-xs text-muted mt-0.5">Kel. Teladan Barat</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 -mt-1 -mr-1 rounded-md hover:bg-base/60 transition text-muted"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-5 overflow-y-auto">
          {SECTIONS.map((section) => (
            <div key={section.label} className="mb-5 last:mb-0">
              <p className="px-5 mb-1.5 font-data text-[10px] tracking-widest text-muted/60 uppercase">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = pathname === item.href;
                const ItemIcon = item.icon;
                const warnaAktif = item.warna === "melati" ? "border-melati" : "border-signal";
                const gradientAktif =
                  item.warna === "melati"
                    ? "bg-gradient-to-r from-melati/10 via-signal/5 to-transparent"
                    : "bg-gradient-to-r from-signal/10 via-melati/5 to-transparent";
                const iconAktif = item.warna === "melati" ? "text-melati" : "text-signal";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 px-5 py-2.5 text-sm transition border-l-2 relative ${
                      active
                        ? `${warnaAktif} text-ink ${gradientAktif}`
                        : "border-transparent text-muted hover:text-ink hover:bg-base/20"
                    }`}
                  >
                    <ItemIcon
                      size={16}
                      strokeWidth={2}
                      className={active ? iconAktif : "text-muted group-hover:text-ink transition"}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-line">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-muted hover:text-danger transition"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}


