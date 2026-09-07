import type { HomePlatformStepId } from "@/types/marketing-page";

export type PlatformStageSlide = {
  stepId: HomePlatformStepId;
  src: string;
  alt: string;
  position: string;
};

/**
 * One visual plate per platform stage — pulled from public/asip-media.
 * Order matches home-copy platform.steps.
 */
export const PLATFORM_STAGE_SLIDES: PlatformStageSlide[] = [
  {
    stepId: "discover",
    src: "/asip-media/home-founder.webp",
    alt: "ASIP founder in conversation at a programme event",
    position: "center 38%",
  },
  {
    stepId: "build",
    src: "/asip-media/programme-workshop.webp",
    alt: "Founders collaborating in an ASIP workshop",
    position: "center 42%",
  },
  {
    stepId: "connect",
    src: "/asip-media/partners-network.webp",
    alt: "Partners and founders meeting at an ecosystem event",
    position: "center 40%",
  },
  {
    stepId: "commercialise",
    src: "/asip-media/partners-stage.webp",
    alt: "Founders presenting on stage at an ASIP gathering",
    position: "center 40%",
  },
  {
    stepId: "scale",
    src: "/asip-media/impact-award.webp",
    alt: "ASIP founders celebrating programme impact",
    position: "center 42%",
  },
];
