import { Box, Tooltip } from "@mui/material";
import { IconBook, IconKey } from "@tabler/icons-react";
import type { EndpointAccess } from "./types";

export function AccessBadge({
  access,
  bare = false,
}: {
  access: EndpointAccess;
  bare?: boolean;
}) {
  const authenticated = access === "authenticated";
  const label = authenticated ? "Authentication required" : "Public endpoint";
  const Icon = authenticated ? IconKey : IconBook;

  return (
    <Tooltip title={label}>
      <Box
        component="span"
        role="img"
        aria-label={label}
        sx={(theme) => ({
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: authenticated ? "secondary.main" : "text.disabled",
          ...(bare
            ? {}
            : {
                width: 20,
                height: 20,
                borderRadius: "4px",
                bgcolor:
                  theme.palette.statusBackground[
                    authenticated ? "info" : "neutral"
                  ],
              }),
        })}
      >
        <Icon size={bare ? 14 : 12} />
      </Box>
    </Tooltip>
  );
}
