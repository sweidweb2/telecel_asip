"use client";

import { LazyMotion, domAnimation, m } from "motion/react";

import { cn } from "@/lib/utils";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
  index: number;
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993-.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046-.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const ROTATIONS = ["rotate-2", "-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-2"];

function Card({
  number,
  title,
  description,
  colorTheme = "blue",
  className,
  rotate,
  colors: customColors,
  index,
}: CardProps) {
  const defaultBgColors = {
    orange: "bg-orange-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
  };
  const defaultTextColors = {
    orange: "text-orange-500",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };
  const defaultBorderColors = {
    orange: "border-orange-100",
    blue: "border-blue-100",
    purple: "border-purple-100",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme];
  const textColor = customColors?.text || defaultTextColors[colorTheme];
  const borderColor = customColors?.border || defaultBorderColors[colorTheme];

  return (
    <m.div
      className={cn(
        "relative h-full w-full transition-transform duration-300 hover:z-20 hover:scale-[1.03]",
        rotate,
        className,
      )}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min((index % 3) * 0.08, 0.24),
      }}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[25px] border border-neutral-100 bg-white p-2 shadow-[0px_10px_20px_0px_#D3D3D3]">
        <Pin className={cn("z-20 mx-auto mb-4 size-8 shrink-0", textColor)} />
        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[15px] border p-[15px]",
            bgColor,
            borderColor,
          )}
        >
          <span
            className={cn("mb-5 text-4xl font-handwriting", textColor)}
            style={{
              fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
            }}
          >
            {number}
          </span>
          <h3 className="mb-[10px] text-2xl leading-none font-semibold text-neutral-800">
            {title}
          </h3>
          <p className="text-sm/5 tracking-tight text-neutral-500">
            {description}
          </p>
        </div>
      </div>
    </m.div>
  );
}

export interface Step {
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
}

const DEFAULT_FEATURES: Step[] = [
  {
    title: "Create Account",
    description:
      "Sign up in minutes. Enter your details and verify your email to get started.",
    colorTheme: "orange",
  },
  {
    title: "Verify Identity",
    description:
      "Complete your profile verification to ensure secure transactions and compliance.",
    colorTheme: "blue",
  },
  {
    title: "Select Plan",
    description:
      "Choose from a variety of investment plans tailored to your financial goals.",
    colorTheme: "purple",
  },
  {
    title: "Analyze & Invest",
    description:
      "Review returns and make your first investment with confidence.",
    colorTheme: "orange",
  },
  {
    title: "Track Growth",
    description:
      "Monitor your portfolio in real-time and watch your wealth grow over time.",
    colorTheme: "blue",
  },
];

export default function HowItWorks({ features, className }: HowItWorksProps) {
  const data = features && features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={cn(
          "relative bg-white px-4 py-12 sm:px-6 md:py-20 lg:px-8",
          className,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-background" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-background" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {data.map((step, index) => (
            <Card
              key={`${step.title}-${index}`}
              number={`0${index + 1}`}
              title={step.title}
              description={step.description}
              colorTheme={step.colorTheme || "blue"}
              colors={step.colors}
              rotate={ROTATIONS[index % ROTATIONS.length]}
              index={index}
            />
          ))}
        </div>
      </div>
    </LazyMotion>
  );
}
