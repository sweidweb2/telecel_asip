import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HttpStatusPage } from "@/components/layout/http-status-page";
import { httpErrorCopyFor } from "@/constants/http-errors";

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: {
    alt: string;
    src?: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
  }) => {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props;
    void [_fill, _priority, _sizes];
    // eslint-disable-next-line @next/next/no-img-element -- Test double for next/image.
    return <img alt={alt} {...rest} />;
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/error/500",
}));

describe("HttpStatusPage", () => {
  it("renders themed copy for each dedicated status", () => {
    for (const kind of ["403", "404", "500", "503"] as const) {
      const copy = httpErrorCopyFor(kind, "en");
      const { unmount } = render(<HttpStatusPage kind={kind} bare />);

      expect(screen.getByText(copy.code)).toBeInTheDocument();
      expect(screen.getByText(copy.title)).toBeInTheDocument();
      expect(screen.getByText(copy.description)).toBeInTheDocument();
      unmount();
    }
  });

  it("shows a custom code label on the generic page", () => {
    render(<HttpStatusPage kind="generic" codeLabel="502" bare />);
    expect(screen.getByText("502")).toBeInTheDocument();
  });
});
