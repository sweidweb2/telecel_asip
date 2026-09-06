import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { EntitySelect } from "@/components/dashboard/entity-select";

const OPTIONS = [
  { id: "11111111-1111-4111-8111-111111111111", label: "Acme Founder" },
  { id: "22222222-2222-4222-8222-222222222222", label: "North Cohort" },
];

function Harness({
  clearable = true,
}: {
  clearable?: boolean;
}) {
  const [value, setValue] = useState<string | null>(OPTIONS[0].id);
  return (
    <EntitySelect
      id="related-founder"
      value={value}
      onValueChange={setValue}
      options={OPTIONS}
      placeholder="None"
      clearable={clearable}
      clearLabel="Clear founder"
    />
  );
}

describe("EntitySelect", () => {
  it("shows the option label instead of the id in the trigger", () => {
    render(<Harness />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Acme Founder");
    expect(screen.queryByText(OPTIONS[0].id)).not.toBeInTheDocument();
  });

  it("clears from a control inside the trigger, not a text button below", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const clear = screen.getByRole("button", { name: "Clear founder" });
    await user.click(clear);

    expect(screen.getByRole("combobox")).toHaveTextContent("None");
  });

  it("does not fall back to the raw id while options are still loading", () => {
    render(
      <EntitySelect
        id="related-founder"
        value={OPTIONS[0].id}
        onValueChange={() => {}}
        options={[]}
        placeholder="Loading…"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Loading…");
    expect(screen.queryByText(OPTIONS[0].id)).not.toBeInTheDocument();
  });
});
