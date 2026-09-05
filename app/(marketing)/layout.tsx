import type { ReactNode } from "react";

/**
 * Public marketing chrome is always light — ignore OS/browser dark preference.
 * `scheme-light` keeps native controls (scrollbars, inputs) on the light palette.
 */
export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col scheme-light">{children}</div>
  );
}
