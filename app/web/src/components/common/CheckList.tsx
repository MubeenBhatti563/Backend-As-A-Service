import { Box } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import { mq } from "../../theme/tokens";

export function CheckList({ items, accent = false }: { items: readonly string[]; accent?: boolean }) {
  return (
    <Box
      component="ul"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: 2.75,
        p: 0,
        m: 0,
        listStyle: "none",
        [mq.mobile]: { flex: "unset" },
      }}
    >
      {items.map((item) => (
        <Box
          component="li"
          key={item}
          sx={{ display: "flex", alignItems: "center", gap: 2.25, color: "text.secondary", fontSize: 12 }}
        >
          <Box component="span" sx={{ display: "flex", flex: "0 0 auto", color: accent ? "secondary.main" : "success.main" }}>
            <IconCheck size={16} aria-hidden />
          </Box>
          {item}
        </Box>
      ))}
    </Box>
  );
}
