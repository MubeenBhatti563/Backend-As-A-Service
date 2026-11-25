"use client";

import React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme/theme";
import { CssBaseline } from "@mui/material";
import { NotificationProvider } from "@/components/notifications";

const ThemeRegistry = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default ThemeRegistry;
