// TerminalPane.tsx – left side of the login screen.
// Needs only: @mui/material, @tabler/icons-react and your theme.ts.
import { Box, Typography } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import { Line } from "../types";
import { FEATURES, HEADING, LINES, TEXT, WINDOW_TITLE } from "..";
import { Brand } from "@/components/common";

/* ------------------------------ helpers ----------------------------- */
// theme.spacing = 4px, so spacing units below are px / 4
const HIDE_BELOW_900 = "@media (max-width: 900px)";
const mono = { typography: "code", fontSize: 12, lineHeight: "16px" } as const;
const dot = (color: string) =>
  ({ width: 10, height: 10, borderRadius: "50%", bgcolor: color }) as const;

function ConsoleLine({ kind, text }: Line) {
  if (kind === "command")
    return <Box sx={{ ...mono, color: "text.disabled" }}>{text}</Box>;
  if (kind === "output")
    return <Box sx={{ ...mono, color: "success.main" }}>{text}</Box>;

  const done = kind === "done";
  return (
    <Box
      sx={{
        ...mono,
        display: "flex",
        alignItems: "center",
        gap: 2,
        color: done ? "success.main" : "text.secondary",
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          display: "flex",
          justifyContent: "center",
          width: 14,
          color: "text.disabled",
        }}
      >
        {done ? "🚀" : <IconCheck size={14} stroke={2.5} />}
      </Box>
      {text}
    </Box>
  );
}

function ConsoleWindow() {
  const steps = LINES.filter((l) => l.kind === "step" || l.kind === "done");
  const commands = LINES.filter(
    (l) => l.kind === "command" || l.kind === "output",
  );

  return (
    <Box
      role="img"
      aria-label="Terminal showing an SDK install and a production deploy"
      sx={{
        width: "100%",
        overflow: "hidden",
        border: 1,
        borderColor: "border.default",
        borderRadius: 1.25,
        bgcolor: "background.input",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 4,
          py: 3,
          backgroundColor: "background.overlay",
          borderBottom: 1,
          borderColor: "border.default",
        }}
      >
        <Box
          aria-hidden
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Box sx={dot("error.main")} />
          <Box sx={dot("warning.main")} />
          <Box sx={dot("success.main")} />
        </Box>
        <Box
          sx={{
            typography: "code",
            fontSize: 11,
            lineHeight: "14px",
            color: "text.disabled",
          }}
        >
          {WINDOW_TITLE}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 5 }}>
        {commands.slice(0, 2).map((l) => (
          <ConsoleLine key={l.text} {...l} />
        ))}
        {commands[2] && <ConsoleLine {...commands[2]} />}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 3 }}>
          {steps.map((l) => (
            <ConsoleLine key={l.text} {...l} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/* ------------------------------ component --------------------------- */
/** Hidden below 900px – render a logo above the form for small screens. */
export function TerminalPane() {
  return (
    <Box
      component="aside"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        flex: "none",
        width: 560,
        p: 10,
        bgcolor: "background.default",
        border: 1,
        borderColor: "border.default",
        [HIDE_BELOW_900]: { display: "none" },
        backgroundColor: "background.canvas",
        height: "100vh",
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}
      >
        <Brand size="lg" />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, lineHeight: "35px" }}
          >
            {HEADING}
          </Typography>
          <Typography
            sx={{ color: "text.secondary", fontSize: 15, lineHeight: 1.5 }}
          >
            {TEXT}
          </Typography>
        </Box>

        <ConsoleWindow />

        <Box
          component="ul"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            m: 0,
            p: 0,
            listStyle: "none",
          }}
        >
          {FEATURES.map((f) => (
            <Box
              component="li"
              key={f}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                aria-hidden
                sx={{
                  display: "grid",
                  placeItems: "center",
                  flex: "none",
                  width: 18,
                  height: 18,
                  borderRadius: "99px",
                  bgcolor: "statusBackground.success",
                  color: "success.main",
                }}
              >
                <IconCheck size={14} stroke={2.5} />
              </Box>
              <Typography
                sx={{
                  color: "common.white",
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: "17px",
                }}
              >
                {f}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
