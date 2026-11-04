"use client";
import {
  Box,
  ButtonBase,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  IconChevronDown,
  IconLayoutGrid,
  IconList,
  IconSearch,
  IconSortDescending,
} from "@tabler/icons-react";
import { useId, useState } from "react";

const fieldSx = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  height: 36,
  px: 3,
  bgcolor: "background.default",
  border: 1,
  borderColor: "border.default",
  borderRadius: 0.75,
  color: "text.secondary",
  fontSize: 12,
  lineHeight: "16px",
} as const;

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

function ToolbarSelect<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
  withSortIcon,
}: {
  ariaLabel: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  withSortIcon?: boolean;
}) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <>
      <ButtonBase
        id={`${id}-button`}
        aria-label={`${ariaLabel}: ${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={anchor ? true : undefined}
        aria-controls={anchor ? `${id}-menu` : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          ...fieldSx,
          flex: "none",
          "&:hover, &[aria-expanded=true]": {
            borderColor: "border.strong",
            color: "text.primary",
          },
        }}
      >
        {withSortIcon && <IconSortDescending size={14} aria-hidden />}
        <Box component="span">{current.label}</Box>
        <IconChevronDown size={12} aria-hidden />
      </ButtonBase>
      <Menu
        id={`${id}-menu`}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{
          list: {
            role: "listbox",
            "aria-labelledby": `${id}-button`,
            dense: true,
          },
          paper: {
            sx: {
              mt: 1,
              minWidth: 140,
              bgcolor: "background.default",
              border: 1,
              borderColor: "border.default",
              borderRadius: 0.75,
            },
          },
        }}
      >
        {options.map((o) => (
          <MenuItem
            key={o.value}
            role="option"
            selected={o.value === value}
            aria-selected={o.value === value}
            onClick={() => {
              onChange(o.value);
              setAnchor(null);
            }}
            sx={{ fontSize: 12 }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export type ProjectView = "grid" | "list";

function ViewSwitch({
  value,
  onChange,
}: {
  value: ProjectView;
  onChange: (v: ProjectView) => void;
}) {
  const button = (key: ProjectView, label: string, icon: React.ReactNode) => (
    <IconButton
      aria-label={label}
      aria-pressed={value === key}
      onClick={() => onChange(key)}
      sx={{
        width: 28,
        height: 28,
        p: 0,
        borderRadius: 0.5,
        color: value === key ? "secondary.main" : "text.secondary",
        bgcolor: value === key ? "background.elevated" : "transparent",
        "&:hover": { bgcolor: "background.elevated" },
      }}
    >
      {icon}
    </IconButton>
  );
  return (
    <Box
      role="group"
      aria-label="View"
      sx={{ ...fieldSx, flex: "none", p: "3px", gap: "2px" }}
    >
      {button("grid", "Grid view", <IconLayoutGrid size={14} aria-hidden />)}
      {button("list", "List view", <IconList size={14} aria-hidden />)}
    </Box>
  );
}

interface ProjectsToolbarProps<S extends string, O extends string> {
  search: string;
  onSearchChange: (v: string) => void;
  status: S;
  statusOptions: SelectOption<S>[];
  onStatusChange: (v: S) => void;
  sort: O;
  sortOptions: SelectOption<O>[];
  onSortChange: (v: O) => void;
  view: ProjectView;
  onViewChange: (v: ProjectView) => void;
}

export function ProjectsToolbar<S extends string, O extends string>(
  p: ProjectsToolbarProps<S, O>,
) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      <Box
        sx={{
          ...fieldSx,
          flexGrow: 1,
          minWidth: 200,
          bgcolor: "background.input",
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <IconSearch size={14} aria-hidden />
        <InputBase
          fullWidth
          type="search"
          value={p.search}
          onChange={(e) => p.onSearchChange(e.target.value)}
          placeholder="Search projects…"
          slotProps={{ input: { "aria-label": "Search projects" } }}
          sx={{
            fontSize: 12,
            lineHeight: "16px",
            color: "text.primary",
            "& input": {
              p: 0,
              height: 16,
              "&::placeholder": { color: "text.secondary", opacity: 1 },
            },
          }}
        />
      </Box>
      <ToolbarSelect
        ariaLabel="Filter by status"
        value={p.status}
        options={p.statusOptions}
        onChange={p.onStatusChange}
      />
      <ToolbarSelect
        ariaLabel="Sort projects"
        value={p.sort}
        options={p.sortOptions}
        onChange={p.onSortChange}
        withSortIcon
      />
      <ViewSwitch value={p.view} onChange={p.onViewChange} />
    </Box>
  );
}
