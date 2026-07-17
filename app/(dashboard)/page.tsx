import dynamic from "next/dynamic";

const PetaPetugas = dynamic(() => import("@/components/PetaPetugas"), { ssr: false });

export default function PetaPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <p className="font-data text-xs text-muted uppercase tracking-widest mb-1">
          01 · Pemantauan
        </p>
        <h2 className="font-display text-2xl font-semibold">Peta Realtime Petugas</h2>
        <p className="text-muted text-sm mt-1">
          Posisi petugas Melati & Bestari diperbarui otomatis via Supabase Realtime.
        </p>
      </div>

      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-melati inline-block" /> Melati
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-bestari inline-block" /> Bestari
        </span>
      </div>

      <div className="flex-1 min-h-[560px] rounded-xl overflow-hidden border border-line">
        <PetaPetugas />
      </div>
    </div>
  );
}
