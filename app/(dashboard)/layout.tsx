"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex bg-base min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar cuma muncul di layar kecil (di bawah md), berisi tombol
            buka drawer sidebar — di desktop sidebar selalu kelihatan jadi
            top bar ini tidak perlu. */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-line bg-panel sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-base/60 transition"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-semibold text-sm">SMART META</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
