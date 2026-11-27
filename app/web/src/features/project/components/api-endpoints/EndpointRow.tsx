import { ButtonBase, Stack, Typography } from "@mui/material";
import { AccessBadge } from "./AccessBadge";
import { MethodBadge } from "./MethodBadge";
import type { Endpoint } from "./types";

export function EndpointRow({
  endpoint,
  selected,
  onSelect,
}: {
  endpoint: Endpoint;
  selected: boolean;
  onSelect: (endpoint: Endpoint) => void;
}) {
  return (
    <ButtonBase
      disableRipple
      aria-pressed={selected}
      onClick={() => onSelect(endpoint)}
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        width: "100%",
        minWidth: 0,
        p: 3,
        textAlign: "left",
        bgcolor: "background.input",
        border: 1,
        borderColor: selected ? "border.strong" : "border.default",
        borderRadius: "8px",
        "&:hover, &.Mui-focusVisible": { borderColor: "primary.main" },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2 }}
        sx={{ alignItems: { xs: "flex-start", sm: "center" }, width: "100%", minWidth: 0 }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <MethodBadge method={endpoint.method} />
          <Typography
            variant="code"
            component="span"
            sx={{ fontSize: 12, fontWeight: 600, overflowWrap: "anywhere" }}
          >
            {endpoint.path}
          </Typography>
          <AccessBadge access={endpoint.access} />
        </Stack>
        <Typography
          noWrap
          sx={{
            flex: 1,
            minWidth: 0,
            width: { xs: "100%", sm: "auto" },
            textAlign: "left",
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {endpoint.summary}
        </Typography>
      </Stack>
    </ButtonBase>
  );
}
