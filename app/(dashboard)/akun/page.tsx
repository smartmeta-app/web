"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Profile = {
  id: string;
  nama: string;
  role: string;
  jenis_petugas: string | null;
  no_hp: string | null;
  is_active: boolean;
  jam_kerja_mulai: string | null;
  jam_kerja_selesai: string | null;
};

export default function AkunPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [tab, setTab] = useState<"petugas" | "warga">("petugas");

  async function load() {
    const { data } = await supabase.from("profiles").select("*").eq("role", tab).order("nama");
    if (data) setUsers(data as Profile[]);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function toggleAktif(id: string, current: boolean) {
    await supabase.from("profiles").update({ is_active: !current }).eq("id", id);
    load();
  }

  async function updateJamKerja(id: string, mulai: string, selesai: string) {
    await supabase
      .from("profiles")
      .update({ jam_kerja_mulai: mulai, jam_kerja_selesai: selesai })
      .eq("id", id);
    load();
  }

  return (
    <div>
      <p className="font-data text-xs text-muted uppercase tracking-widest mb-1">05 · Akun</p>
      <h2 className="font-display text-2xl font-semibold mb-1">Manajemen Akun</h2>
      <p className="text-muted text-sm mb-5">
        Kelola akun petugas dan warga. Penambahan akun baru dibuat lewat Supabase Auth
        (undang via email) lalu otomatis muncul di sini setelah profil terisi.
      </p>

      <div className="flex gap-2 mb-5">
        {(["petugas", "warga"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs border capitalize ${
              tab === t ? "bg-panel border-signal text-ink" : "border-line text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-panel text-muted text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Nama</th>
              <th className="text-left px-4 py-3">No. HP</th>
              {tab === "petugas" && (
                <>
                  <th className="text-left px-4 py-3">Jenis</th>
                  <th className="text-left px-4 py-3">Jam Kerja</th>
                </>
              )}
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3">{u.nama}</td>
                <td className="px-4 py-3 font-data text-xs">{u.no_hp ?? "-"}</td>
                {tab === "petugas" && (
                  <>
                    <td className="px-4 py-3 capitalize">{u.jenis_petugas ?? "-"}</td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        defaultValue={u.jam_kerja_mulai ?? "07:00"}
                        onBlur={(e) =>
                          updateJamKerja(u.id, e.target.value, u.jam_kerja_selesai ?? "15:00")
                        }
                        className="bg-base border border-line rounded px-1.5 py-1 text-xs mr-1"
                      />
                      <input
                        type="time"
                        defaultValue={u.jam_kerja_selesai ?? "15:00"}
                        onBlur={(e) =>
                          updateJamKerja(u.id, u.jam_kerja_mulai ?? "07:00", e.target.value)
                        }
                        className="bg-base border border-line rounded px-1.5 py-1 text-xs"
                      />
                    </td>
                  </>
                )}
                <td className="px-4 py-3">
                  <span className={u.is_active ? "text-melati" : "text-danger"}>
                    {u.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAktif(u.id, u.is_active)}
                    className="text-xs border border-line rounded-md px-2.5 py-1 hover:border-signal transition"
                  >
                    {u.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
