import { Box, Stack, Typography } from "@mui/material";
import { EndpointRow } from "./EndpointRow";
import type { Endpoint, EndpointGroup } from "./types";

export function EndpointListCard({
  groups,
  selectedId,
  onSelect,
}: {
  groups: EndpointGroup[];
  selectedId: string;
  onSelect: (endpoint: Endpoint) => void;
}) {
  return (
    <Box
      component="section"
      aria-labelledby="sample-endpoints-heading"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        minWidth: 0,
        p: { xs: 4, sm: 5 },
        bgcolor: "background.default",
        border: 1,
        borderColor: "border.default",
        borderRadius: 1.5,
      }}
    >
      <Typography id="sample-endpoints-heading" component="h2" sx={{ fontWeight: 600 }}>
        Endpoint examples
      </Typography>
      <Stack spacing={4} useFlexGap sx={{ minWidth: 0 }}>
        {groups.map((group) => (
          <Stack
            key={group.id}
            component="section"
            aria-label={group.title}
            spacing={2}
            useFlexGap
          >
            <Typography
              component="h3"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "text.disabled",
                textTransform: "uppercase",
              }}
            >
              {group.title}
            </Typography>
            {group.endpoints.map((endpoint) => (
              <EndpointRow
                key={endpoint.id}
                endpoint={endpoint}
                selected={endpoint.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
