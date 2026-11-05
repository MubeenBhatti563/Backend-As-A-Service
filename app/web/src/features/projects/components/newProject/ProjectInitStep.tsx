"use client";
// ProjectInitStep.tsx – right side of onboarding step 2 while the project is being created ("Setting up your project...").
// Presentational: feed it the progress you get from your API (polling / websocket) and it renders the checklist + bar.
// Needs: @mui/material, @tabler/icons-react. Render it inside:
//   <OnboardingLayout currentStep="project" contentWidth={600} pinSidebarFooter stepTitles={{ project: "Configure Instance" }}>
import { Box, Typography } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { StepHeader } from "./StepHeader";

const FONT_MONO = 'var(--font-geist-mono), "Geist Mono", monospace';

const COPY = {
  label: "Initializing Instance",
  title: "Setting up your project...",
  description:
    "We are provisioning serverless hardware resources, isolating network routes, setting database connection pools, and building edge routing systems globally.",
} as const;

export const PROVISION_TASKS = [
  "Creating project workspace",
  "Provisioning global relational database",
  "Configuring edge API layers",
  "Generating client SDK credentials",
  "Project ready for deployment",
] as const;

type TaskState = "done" | "active" | "pending";

function TaskIcon({ state }: { state: TaskState }) {
  const base = {
    display: "grid",
    placeItems: "center",
    flex: "none",
    width: 20,
    height: 20,
    borderRadius: "99px",
  } as const;
  if (state === "done") {
    return (
      <Box
        aria-hidden
        sx={{
          ...base,
          bgcolor: "rgba(16, 185, 129, 0.08)",
          color: "success.main",
        }}
      >
        <IconCheck size={12} stroke={2.5} />
      </Box>
    );
  }
  if (state === "active") {
    return (
      <Box
        aria-hidden
        sx={{
          ...base,
          border: 1,
          borderColor: "primary.main",
          bgcolor: "rgba(37, 99, 235, 0.08)",
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "99px",
            bgcolor: "info.main",
          }}
        />
      </Box>
    );
  }
  return (
    <Box aria-hidden sx={{ ...base, border: 1, borderColor: "border.default" }}>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "99px",
          bgcolor: "text.disabled",
        }}
      />
    </Box>
  );
}

interface ProjectInitStepProps {
  /** Index of the task being worked on (0-based). Tasks before it are done, after it pending. Use tasks.length when everything is done. */
  activeIndex: number;
  /** 0–100. */
  progress: number;
  /** Line above the bar, e.g. "Deploying US-East Cluster...". */
  statusText?: string;
  tasks?: readonly string[];
  /** Called once when progress reaches 100 (e.g. router.push to the next step). */
  onComplete?: () => void;
}

export function ProjectInitStep({
  activeIndex,
  progress,
  statusText = "Deploying US-East Cluster...",
  tasks = PROVISION_TASKS,
  onComplete,
}: ProjectInitStepProps) {
  const percent = Math.min(100, Math.max(0, Math.round(progress)));

  const completed = useRef(false);
  useEffect(() => {
    if (percent >= 100 && !completed.current) {
      completed.current = true;
      onComplete?.();
    }
  }, [percent, onComplete]);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}
    >
      <StepHeader
        step={2}
        label={COPY.label}
        title={COPY.title}
        description={COPY.description}
        size="compact"
      />

      <Box
        component="ol"
        aria-label="Provisioning progress"
        sx={{
          listStyle: "none",
          m: 0,
          p: "23px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          bgcolor: "background.default",
          border: 1,
          borderColor: "border.default",
          borderRadius: 1.5,
        }}
      >
        {tasks.map((task, i) => {
          const state: TaskState =
            i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
          return (
            <Box
              component="li"
              key={task}
              aria-current={state === "active" ? "step" : undefined}
              sx={{ display: "flex", alignItems: "center", gap: 3 }}
            >
              <TaskIcon state={state} />
              <Typography
                component="span"
                sx={{
                  flexGrow: 1,
                  color: state === "pending" ? "text.disabled" : "text.primary",
                  fontSize: 14,
                  fontWeight: state === "active" ? 600 : 400,
                  lineHeight: "18px",
                }}
              >
                {task}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
            fontFamily: FONT_MONO,
            fontSize: 12,
            lineHeight: "16px",
          }}
        >
          <Typography
            role="status"
            aria-live="polite"
            component="span"
            sx={{
              color: "text.secondary",
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
            }}
          >
            {statusText}
          </Typography>
          <Typography
            component="span"
            sx={{
              color: "info.main",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: 700,
              lineHeight: "inherit",
            }}
          >
            {percent}%
          </Typography>
        </Box>
        <Box
          role="progressbar"
          aria-label="Project setup progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          sx={{
            height: 8,
            bgcolor: "border.default",
            borderRadius: "99px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${percent}%`,
              height: "100%",
              bgcolor: "primary.main",
              transition: "width 400ms ease",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
