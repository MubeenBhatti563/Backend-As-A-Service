import { SURFACE } from "../../constants";

export const toolbarButtonSx = {
  minHeight: 33,
  px: 3,
  py: 1,
  borderRadius: "6px",
  fontSize: 13,
  lineHeight: "17px",
  fontWeight: 400,
  color: "text.primary",
  bgcolor: SURFACE,
  whiteSpace: "nowrap",
  "& .MuiButton-startIcon": { mr: "6px", ml: 0 },
} as const;
