import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A1830",       // navy gelap, latar utama (sesuai biru logo)
        panel: "#0F2340",      // panel/card
        line: "#1E3A5F",       // border halus
        ink: "#EEF4FA",        // teks utama, off-white sejuk
        muted: "#93AAC4",      // teks sekunder
        signal: "#2F8AF0",     // biru terang — status live / perhatian / aksen utama
        melati: "#22B573",     // hijau — kategori Melati (sesuai daun/META di logo)
        bestari: "#5AA9E6",    // biru muda — kategori Bestari (sesuai lingkaran logo)
        accentGreen: "#1FAE64", // hijau sekunder untuk gradasi/aksen
        danger: "#E1554C",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        data: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
