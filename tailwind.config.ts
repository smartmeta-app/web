import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0F1E1B",       // deep slate-teal, latar utama
        panel: "#16302A",      // panel/card
        line: "#274038",       // border halus
        ink: "#EFEAE0",        // teks utama, off-white hangat
        muted: "#9FB3AC",      // teks sekunder
        signal: "#E8A33D",     // amber — status live / perhatian
        melati: "#7FB88F",     // hijau sage — kategori Melati
        bestari: "#6E9BC7",    // biru berdebu — kategori Bestari
        danger: "#D9695F",
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
