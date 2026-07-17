import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          dark:     "#070B14",
          navy:     "#0F1830",
          midnight: "#17233F",
          royal:    "#3B5BDB",
          "royal-light": "#7C93F0",
          "royal-dim":   "#1F2E63",
          silver:   "#C7D0DE",
          "silver-light": "#E7ECF4",
          "silver-dim":   "#77839A",
          white:    "#F2F5FA",
          gray:     "#7C879C",
          beige:    "#E7ECF4",
          surface:  "#F2F5FA",
          accent:   "#8FA3E8",
        },
      },
      fontFamily: {
        tajawal: ["var(--font-tajawal)", "sans-serif"],
        noto:    ["var(--font-noto-arabic)", "sans-serif"],
        playfair:["var(--font-playfair)", "serif"],
        inter:   ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "royal-linear": "linear-gradient(135deg,#7C93F0 0%,#3B5BDB 50%,#1F2E63 100%)",
        "dark-linear":  "linear-gradient(135deg,#070B14 0%,#17233F 100%)",
        "hero-mesh":    "radial-gradient(ellipse 80% 60% at 50% -10%,rgba(59,91,219,0.20) 0%,transparent 60%)",
      },
      keyframes: {
        float:     { "0%,100%":{ transform:"translateY(0)" }, "50%":{ transform:"translateY(-14px)" } },
        pulse_ring:{ "0%":{ transform:"scale(0.8)", opacity:"1" }, "100%":{ transform:"scale(2.2)", opacity:"0" } },
        shimmer:   { "0%":{ backgroundPosition:"-200% center" }, "100%":{ backgroundPosition:"200% center" } },
        orbit:     { from:{ transform:"rotate(0deg) translateX(80px) rotate(0deg)" }, to:{ transform:"rotate(360deg) translateX(80px) rotate(-360deg)" } },
      },
      animation: {
        float:      "float 5s ease-in-out infinite",
        pulse_ring: "pulse_ring 2s ease-out infinite",
        shimmer:    "shimmer 4s linear infinite",
        orbit:      "orbit 8s linear infinite",
      },
      boxShadow: {
        "royal-glow":    "0 0 30px rgba(59,91,219,0.35), 0 0 80px rgba(59,91,219,0.15)",
        "royal-glow-sm": "0 0 12px rgba(59,91,219,0.4)",
        "dark-xl":       "0 25px 60px rgba(7,11,20,0.5)",
        "inner-royal":   "inset 0 1px 0 rgba(199,208,222,0.25)",
      },
      borderColor: {
        "royal": "#3B5BDB",
        "royal-dim": "rgba(59,91,219,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
