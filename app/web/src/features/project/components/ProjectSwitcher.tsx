"use client";
import { Box, ButtonBase, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import NextLink from "next/link";
import { useId, useState } from "react";
import { PROJECT_ROUTES } from "../constants";
import type { ProjectOption } from "../types";

interface ProjectSwitcherProps {
  projects: ProjectOption[];
  currentId: string;
}

export function ProjectSwitcher({ projects, currentId }: ProjectSwitcherProps) {
  const id = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const current = projects.find((p) => p.id === currentId) ?? projects[0];

  return (
    <>
      <ButtonBase
        id={`${id}-button`}
        aria-label="Switch project"
        aria-haspopup="menu"
        aria-expanded={open ? true : undefined}
        aria-controls={open ? `${id}-menu` : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ display: "flex", alignItems: "center", gap: 1.5, px: "9px", py: "3px", bgcolor: "background.default", border: 1, borderColor: "border.default", borderRadius: 0.75, "&:hover": { bgcolor: "background.elevated" } }}
      >
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, lineHeight: "17px" }}>{current?.name}</Typography>
        <IconChevronDown size={12} color="#94A3B8" aria-hidden />
      </ButtonBase>

      <Menu
        id={`${id}-menu`}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          list: { "aria-labelledby": `${id}-button`, dense: true, sx: { py: 1 } },
          paper: { sx: { mt: 2, minWidth: 200, bgcolor: "background.default", border: 1, borderColor: "border.default", borderRadius: 1 } },
        }}
      >
        {projects.map((p) => (
          <MenuItem
            key={p.id}
            component={NextLink}
            href={PROJECT_ROUTES.forProject(p.id).overview}
            selected={p.id === currentId}
            onClick={() => setAnchorEl(null)}
            sx={{ mx: 1, borderRadius: 0.75, fontSize: 13, "&.Mui-selected": { bgcolor: "background.elevated" } }}
          >
            <Box component="span" sx={{ flexGrow: 1 }}>{p.name}</Box>
            {p.id === currentId && (
              <ListItemIcon sx={{ minWidth: 0, ml: 4, color: "primary.main" }}><IconCheck size={14} aria-hidden /></ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
