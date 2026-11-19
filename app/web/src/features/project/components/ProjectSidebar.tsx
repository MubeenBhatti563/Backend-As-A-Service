"use client";
import { Box } from "@mui/material";
import { MOBILE } from "../styles";
import { ProjectNav, type ProjectNavKey } from "./ProjectNav";

export function ProjectSidebar({
  projectId,
  activeKey,
}: {
  projectId: string;
  activeKey?: ProjectNavKey;
}) {
  return (
    <Box
      component="aside"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "none",
        width: 240,
        p: 4,
        overflowY: "auto",
        bgcolor: "background.canvas",
        borderRight: 1,
        borderColor: "border.default",
        [MOBILE]: { display: "none" },
      }}
    >
      <ProjectNav projectId={projectId} activeKey={activeKey} />
    </Box>
  );
}
