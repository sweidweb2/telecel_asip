import localFont from "next/font/local";

export const sourceSans = localFont({
  src: "../app/fonts/source-sans-3-latin.woff2",
  variable: "--font-source-sans",
  weight: "200 900",
  style: "normal",
  display: "swap",
});

export const sora = localFont({
  src: "../app/fonts/sora-latin.woff2",
  variable: "--font-sora",
  weight: "100 800",
  style: "normal",
  display: "swap",
});

export const geistMono = localFont({
  src: "../app/fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  style: "normal",
  display: "swap",
});
