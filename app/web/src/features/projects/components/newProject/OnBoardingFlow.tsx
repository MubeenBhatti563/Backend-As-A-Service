"use client";
import { useEffect, useState } from "react";
import {
  OnboardingLayout,
  type OnboardingLayoutProps,
} from "./OnboardingLayout";
import { WelcomeStep } from "./WelcomeStep";
import { CreateProjectStep } from "./CreateProjectStep";
import { ProjectInitStep, PROVISION_TASKS } from "./ProjectInitStep";
import { ProjectReadyStep, type ProjectCredentials } from "./ProjectReadyStep";
import type { CreateProjectPayload } from "../../schemas/create-project.schema";

type Step = "welcome" | "project" | "initializing" | "ready";

const WIDE = {
  contentWidth: 600,
  pinSidebarFooter: true,
  stepTitles: { project: "Configure Instance" },
} as const;

// Layout props per step (same values your four pages passed before).
const LAYOUT: Record<Step, Omit<OnboardingLayoutProps, "children">> = {
  welcome: { currentStep: "welcome" },
  project: { currentStep: "project" },
  initializing: { currentStep: "project", ...WIDE },
  ready: { currentStep: "sdk", ...WIDE },
};

interface CreatedProject {
  name: string;
  credentials: ProjectCredentials;
}

// TODO: replace with your real API call.
async function createProject(p: CreateProjectPayload): Promise<CreatedProject> {
  return {
    name: p.name,
    credentials: {
      endpointUrl: `https://api.devstack.io/v1/${p.name}`,
      publicKey: "pk_live_abc123789f238ab9cd00e8f821",
      secretKey: "",
    },
  };
}

function ProvisioningScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 5)), 400);
    return () => clearInterval(id);
  }, []);

  const activeIndex =
    progress >= 100
      ? PROVISION_TASKS.length
      : Math.floor((progress / 100) * PROVISION_TASKS.length);

  return (
    <ProjectInitStep
      activeIndex={activeIndex}
      progress={progress}
      onComplete={onComplete}
    />
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [project, setProject] = useState<CreatedProject | null>(null);

  return (
    <OnboardingLayout {...LAYOUT[step]}>
      {step === "welcome" && <WelcomeStep onNext={() => setStep("project")} />}

      {step === "project" && (
        <CreateProjectStep
          onBack={() => setStep("welcome")}
          onSubmit={async (payload) => setProject(await createProject(payload))}
          onSuccess={() => setStep("initializing")}
        />
      )}

      {step === "initializing" && (
        <ProvisioningScreen onComplete={() => setStep("ready")} />
      )}

      {step === "ready" && project && (
        <ProjectReadyStep
          projectName={project.name}
          credentials={project.credentials}
        />
      )}
    </OnboardingLayout>
  );
}
