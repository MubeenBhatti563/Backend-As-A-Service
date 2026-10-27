// routes/home.tsx – the page is just composition; no data or styling lives here.
"use client";
import { Box } from "@mui/material";
import { SITE } from "@/constants/homePage";
import { SECTION_IDS } from "../config/routes";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import {
  AiCopilot,
  Architecture,
  Faq,
  Features,
  Hero,
  Pipeline,
  Pricing,
  SdkExamples,
  Security,
  TrustedBy,
  Workflow,
} from "../components/sections/home";
import { SURFACE } from "../theme/tokens";

export function meta() {
  return [
    { title: SITE.title },
    { name: "description", content: SITE.description },
  ];
}

export default function HomeRoute() {
  return (
    <Box
      sx={{
        width: "100%",
        // `clip` (not `hidden`) so the sticky navbar keeps working
        overflowX: "clip",
        bgcolor: SURFACE.base,
        color: "text.primary",
      }}
    >
      <Navbar />
      <Box component="main" id={SECTION_IDS.top}>
        <Hero />
        <TrustedBy />
        <Features />
        <Pipeline />
        <Workflow />
        <AiCopilot />
        <Architecture />
        <SdkExamples />
        <Security />
        <Pricing />
        <Faq />
      </Box>
      <Footer />
    </Box>
  );
}
