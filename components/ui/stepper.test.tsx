import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTrigger,
} from "@/components/ui/stepper";

const STEPS = [
  { id: "core", title: "Core" },
  { id: "profile", title: "Profile" },
];

function Harness({ forceMount = false }: { forceMount?: boolean }) {
  const [step, setStep] = useState("core");
  return (
    <Stepper
      steps={STEPS}
      value={step}
      onValueChange={setStep}
      orientation="horizontal"
    >
      <StepperNav>
        {STEPS.map((s) => (
          <StepperItem key={s.id} stepId={s.id}>
            <StepperTrigger>{s.title}</StepperTrigger>
          </StepperItem>
        ))}
      </StepperNav>
      <StepperPanel>
        <StepperContent value="core" forceMount={forceMount}>
          Core fields
        </StepperContent>
        <StepperContent value="profile" forceMount={forceMount}>
          Profile fields
        </StepperContent>
      </StepperPanel>
    </Stepper>
  );
}

describe("StepperContent", () => {
  it("unmounts inactive steps by default", () => {
    render(<Harness />);

    expect(screen.getByText("Core fields")).toBeInTheDocument();
    expect(screen.queryByText("Profile fields")).not.toBeInTheDocument();
  });

  it("keeps inactive steps in the DOM when forceMount is set", () => {
    render(<Harness forceMount />);

    expect(screen.getByText("Core fields")).toBeInTheDocument();
    expect(screen.getByText("Profile fields")).not.toBeVisible();
  });

  it("mounts the next step when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("tab", { name: "Profile" }));

    expect(screen.queryByText("Core fields")).not.toBeInTheDocument();
    expect(screen.getByText("Profile fields")).toBeInTheDocument();
  });
});
