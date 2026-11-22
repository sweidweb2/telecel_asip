import localFont from "next/font/local";

/**
 * Production marketing/UI stack is self-hosted and licence-cleared for the app:
 * Source Sans 3 (body) + Sora (headings). The Design Brief’s Century Gothic is
 * **not** loaded until Telecel supplies a web licence — do not hotlink or
 * embed unlicensed Century Gothic files.
 */

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
