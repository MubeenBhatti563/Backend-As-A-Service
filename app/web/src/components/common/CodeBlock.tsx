import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { SYNTAX_COLOR } from "@/theme/tokens";
import type { CodeLine } from "@/types/homePage";

interface CodeBlockProps {
  lines: readonly CodeLine[];
  sx?: SxProps<Theme>;
}

/** Renders tokenised code. Lines are data, so no <br />/&nbsp; hacks. */
export function CodeBlock({ lines, sx }: CodeBlockProps) {
  return (
    <Box
      component="pre"
      sx={[
        {
          m: 0,
          typography: "code",
          fontSize: 10,
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
          color: "text.primary",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {lines.map((line, i) => (
        <Box component="span" key={i} sx={{ display: "block" }}>
          {line.length === 0
            ? " "
            : line.map((seg, j) =>
                typeof seg === "string" ? (
                  seg
                ) : (
                  <Box
                    component="span"
                    key={j}
                    sx={{ color: SYNTAX_COLOR[seg[0]] }}
                  >
                    {seg[1]}
                  </Box>
                ),
              )}
        </Box>
      ))}
    </Box>
  );
}
