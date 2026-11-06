"use client";

import { useEffect, useRef, useState } from "react";
import {
  OnboardingLayout,
  type OnboardingLayoutProps,
} from "./OnboardingLayout";
import { WelcomeStep } from "./WelcomeStep";
import { CreateProjectStep } from "./CreateProjectStep";
import { ProjectInitStep, PROVISION_TASKS } from "./ProjectInitStep";
import { ProjectReadyStep, type ProjectCredentials } from "./ProjectReadyStep";
import type { CreateProjectPayload } from "../../schemas/create-project.schema";
import { usePostProject } from "../../hooks/use-project";

type Step = "welcome" | "project" | "initializing" | "ready";

const WIDE = {
  contentWidth: 600,
  pinSidebarFooter: true,
  stepTitles: { project: "Configure Instance" },
} as const;

// Layout props per step
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

function ProvisioningScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(id);
          return 100;
        }
        return Math.min(100, prev + 5);
      });
    }, 400);

    return () => clearInterval(id);
  }, []);

  const handleStepComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      // Brief delay so the user perceives the 100% completed checklist before transition
      setTimeout(onComplete, 600);
    }
  };

  const activeIndex =
    progress >= 100
      ? PROVISION_TASKS.length
      : Math.floor((progress / 100) * PROVISION_TASKS.length);

  return (
    <ProjectInitStep
      activeIndex={activeIndex}
      progress={progress}
      onComplete={handleStepComplete}
    />
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [project, setProject] = useState<CreatedProject | null>(null);
  const newProject = usePostProject();

  async function createProject(
    p: CreateProjectPayload,
  ): Promise<CreatedProject> {
    const data = await newProject.mutateAsync(p);

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "https://api.devstack.io/v1";

    const projectId = data?.project?.id || data?.project?.schemaName || p.name;

    return {
      name: data?.project?.name || p.name,
      credentials: {
        endpointUrl: `${apiBase}/${projectId}`,
        publicKey: data?.keys?.anon || "",
        secretKey: data?.keys?.service || "",
      },
    };
  }

  return (
    <OnboardingLayout {...LAYOUT[step]}>
      {step === "welcome" && <WelcomeStep onNext={() => setStep("project")} />}

      {step === "project" && (
        <CreateProjectStep
          onBack={() => setStep("welcome")}
          onSubmit={async (payload) => {
            const created = await createProject(payload);
            setProject(created);
          }}
          onSuccess={() => setStep("initializing")}
        />
      )}

      {step === "initializing" && (
        <ProvisioningScreen onComplete={() => setStep("ready")} />
      )}

      {step === "ready" && (
        project ? (
          <ProjectReadyStep
            projectName={project.name}
            credentials={project.credentials}
          />
        ) : (
          <WelcomeStep onNext={() => setStep("project")} />
        )
      )}
    </OnboardingLayout>
  );
}
