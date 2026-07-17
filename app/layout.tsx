import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMART META — Kelurahan Teladan Barat",
  description: "Pusat kendali pemantauan petugas kebersihan Melati & Bestari",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
