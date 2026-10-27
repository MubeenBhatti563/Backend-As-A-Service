// theme.ts
import { createTheme } from "@mui/material/styles";
import type { Shadows } from "@mui/material/styles";
import type { CSSProperties } from "react";

declare module "@mui/material/styles" {
  interface TypeBackground {
    main: string;
    canvas: string;
    elevated: string;
    input: string;
    overlay: string;
  }

  interface Palette {
    border: {
      default: string;
      strong: string;
    };
    statusBackground: {
      primary: string;
      info: string;
      success: string;
      warning: string;
      error: string;
      neutral: string;
    };
  }

  interface PaletteOptions {
    border?: {
      default: string;
      strong: string;
    };
    statusBackground?: {
      primary: string;
      info: string;
      success: string;
      warning: string;
      error: string;
      neutral: string;
    };
  }

  interface TypographyVariants {
    code: CSSProperties;
  }

  interface TypographyVariantsOptions {
    code?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    code: true;
  }
}

export const colors = {
  background: {
    default: "#0e111a",
    main: "#0e111a",
    canvas: "#161a24",
    paper: "#1d2433",
    elevated: "#171F30",
    input: "#070B16",
    overlay: "#0e111aD9",
  },

  primary: "#2563EB",
  secondary: "#06B6D4",

  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    disabled: "#64748B",
    inverse: "#0e111a",
  },

  border: {
    default: "#1E293B",
    strong: "#334155",
  },

  statusBackground: {
    primary: "#2563EB15",
    info: "#06B6D415",
    success: "#10B98115",
    warning: "#F59E0B15",
    error: "#EF444415",
    neutral: "#64748B15",
  },
} as const;

const shadows = Array(25).fill("none") as unknown as Shadows;

export const theme = createTheme({
  palette: {
    mode: "dark",

    common: {
      black: "#000000",
      white: "#FFFFFF",
    },

    primary: {
      main: colors.primary,
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: colors.secondary,
      contrastText: "#0e111a",
    },

    success: {
      main: colors.success,
      contrastText: "#0e111a",
    },

    warning: {
      main: colors.warning,
      contrastText: "#0e111a",
    },

    error: {
      main: colors.error,
      contrastText: "#FFFFFF",
    },

    info: {
      main: colors.info,
      contrastText: "#FFFFFF",
    },

    background: colors.background,

    text: colors.text,

    divider: colors.border.default,

    border: colors.border,

    statusBackground: colors.statusBackground,

    action: {
      active: colors.text.secondary,
      hover: "#171F30",
      selected: "#2563EB15",
      focus: "#2563EB1F",
      disabled: colors.text.disabled,
      disabledBackground: "#64748B15",
    },
  },

  typography: {
    fontFamily: "var(--font-geist-sans), Geist, Inter, system-ui, sans-serif",

    h1: {
      fontFamily: "var(--font-outfit), Outfit, sans-serif",
      fontSize: "4rem",
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-1.5px",
    },

    h2: {
      fontFamily: "var(--font-outfit), Outfit, sans-serif",
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },

    h3: {
      fontFamily: "var(--font-outfit), Outfit, sans-serif",
      fontSize: "2rem",
      fontWeight: 800,
      lineHeight: 1.2,
    },

    h4: {
      fontFamily: "var(--font-outfit), Outfit, sans-serif",
      fontSize: "1.75rem",
      fontWeight: 800,
      lineHeight: 1.25,
    },

    h5: {
      fontFamily: "var(--font-outfit), Outfit, sans-serif",
      fontSize: "1.5rem",
      fontWeight: 800,
      lineHeight: 1.3,
    },

    h6: {
      fontFamily: "var(--font-outfit), Outfit, sans-serif",
      fontSize: "1.125rem",
      fontWeight: 700,
      lineHeight: 1.35,
    },

    subtitle1: {
      fontFamily: "var(--font-outfit), Outfit, sans-serif",
      fontSize: "1rem",
      fontWeight: 600,
    },

    subtitle2: {
      fontFamily: "var(--font-outfit), Outfit, sans-serif",
      fontSize: "0.875rem",
      fontWeight: 600,
    },

    body1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },

    body2: {
      fontSize: "0.8125rem",
      fontWeight: 400,
      lineHeight: 1.4,
    },

    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      lineHeight: 1,
      textTransform: "none",
    },

    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.4,
    },

    overline: {
      fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
      fontSize: "0.6875rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "1.2px",
      textTransform: "uppercase",
    },

    code: {
      fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
      fontSize: "0.8125rem",
      lineHeight: 1.5,
    },
  },

  // The project follows a 4px spacing scale.
  spacing: 4,

  shape: {
    borderRadius: 8,
  },

  shadows,

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.default,
          color: colors.text.primary,
        },

        code: {
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
        },

        "*": {
          scrollbarColor: `${colors.border.strong} ${colors.background.default}`,
        },
      },
    },

    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: colors.background.default,
          backgroundImage: "none",
          borderBottom: `1px solid ${colors.border.default}`,
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.paper,
          backgroundImage: "none",
          borderRight: `1px solid ${colors.border.default}`,
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          border: `1px solid ${colors.border.default}`,
          borderRadius: 12,
          boxShadow: "none",
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 8,
          padding: "12px 24px",
          fontWeight: 600,
          textTransform: "none",
        },

        outlined: {
          borderColor: colors.border.default,

          "&:hover": {
            borderColor: colors.border.strong,
            backgroundColor: colors.background.elevated,
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.input,
          borderRadius: 8,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border.default,
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border.strong,
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary,
          },
        },

        input: {
          padding: "12px 16px",
          fontSize: 14,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 99,
          fontSize: 11,
          fontWeight: 600,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border.default,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.border.default,
          color: colors.text.secondary,
          fontSize: 13,
        },

        head: {
          color: colors.text.primary,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.paper,
          border: `1px solid ${colors.border.default}`,
          borderRadius: 16,
          boxShadow: "0 16px 32px #00000080",
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.background.elevated,
          color: colors.text.primary,
          border: `1px solid ${colors.border.default}`,
          borderRadius: 6,
          fontSize: 12,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.border.default}`,
        },
      },
    },
  },
});

export default theme;
