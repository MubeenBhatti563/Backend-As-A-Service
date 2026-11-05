"use client";
import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import {
  ProjectsToolbar,
  type ProjectView,
  type SelectOption,
} from "./ProjectsToolbar";
import { Project, ProjectStatus } from "@/types/projectPage";
import {
  badgeSx,
  font,
  HIDE_BELOW_720,
} from "@/features/projects/components/projectStyle";

type StatusFilter = "all" | ProjectStatus;
type SortKey = "updated" | "name" | "status";

const STATUS_OPTIONS: SelectOption<StatusFilter>[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];
const SORT_OPTIONS: SelectOption<SortKey>[] = [
  { value: "updated", label: "Last updated" },
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
];

const SORTERS: Record<SortKey, (a: Project, b: Project) => number> = {
  updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  name: (a, b) => a.name.localeCompare(b.name),
  status: (a, b) =>
    a.status.localeCompare(b.status) || a.name.localeCompare(b.name),
};

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<ProjectView>("grid");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (!q ||
            `${p.name} ${p.identifier} ${p.description}`
              .toLowerCase()
              .includes(q)),
      )
      .sort(SORTERS[sort]);
  }, [projects, search, status, sort]);

  const activeCount = projects.filter((p) => p.status === "active").length;
  const pausedCount = projects.length - activeCount;
  const showingAll = visible.length === projects.length;

  return (
    <Box
      component="section"
      aria-labelledby="projects-heading"
      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            id="projects-heading"
            variant="h5"
            component="h2"
            sx={{
              fontFamily: font.display,
              fontSize: 20,
              fontWeight: 600,
              lineHeight: "25px",
            }}
          >
            All projects
          </Typography>
          <Box component="span" sx={badgeSx}>
            {projects.length}
          </Box>
        </Box>
        <Typography
          sx={{ color: "text.secondary", fontSize: 12, lineHeight: "16px" }}
        >
          {activeCount} active · {pausedCount} paused
        </Typography>
      </Box>

      <ProjectsToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        statusOptions={STATUS_OPTIONS}
        onStatusChange={setStatus}
        sort={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      {visible.length ? (
        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns:
              view === "grid" ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
            [HIDE_BELOW_720]: { gridTemplateColumns: "minmax(0, 1fr)" },
          }}
        >
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Box>
      ) : (
        <Typography
          role="status"
          sx={{
            py: 10,
            textAlign: "center",
            color: "text.secondary",
            fontSize: 13,
          }}
        >
          No projects match your filters.
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          sx={{ color: "text.disabled", fontSize: 11, lineHeight: "14px" }}
        >
          {showingAll
            ? `Showing all ${projects.length} projects`
            : `Showing ${visible.length} of ${projects.length} projects`}
        </Typography>
        <Typography
          sx={{ color: "text.disabled", fontSize: 11, lineHeight: "14px" }}
        >
          Storage includes paused projects · 1 GB = 1,000 MB
        </Typography>
      </Box>
    </Box>
  );
}
