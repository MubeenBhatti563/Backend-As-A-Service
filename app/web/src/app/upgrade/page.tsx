"use client";

import { Brand } from "@/components/common";
import { ACCOUNT_ROUTES, ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores";
import { Box, Button, Divider, Typography } from "@mui/material";
import { IconArrowRight, IconCheck, IconSparkles } from "@tabler/icons-react";
import NextLink from "next/link";

const FEATURES = [
  ["Projects", "2", "10"],
  ["Database storage", "500 MB", "8 GB"],
  ["File storage", "1 GB", "10 GB"],
  ["API requests", "50,000 / month", "1 million / month"],
  ["Realtime connections", "10", "200 concurrent"],
];

export default function UpgradePage() {
  const { user } = useAuthStore();

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.input",
        color: "text.primary",
      }}
    >
      <Box
        component="header"
        sx={{
          height: 68,
          px: { xs: 4, md: 10 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "border.default",
        }}
      >
        <Brand size="sm" />
        {user === null && (
          <Button
            component={NextLink}
            href={ROUTES.signIn}
            variant="text"
            sx={{ color: "text.secondary", fontSize: 12 }}
          >
            Sign in
          </Button>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: 1040,
          mx: "auto",
          px: 4,
          py: { xs: 8, md: 12 },
        }}
      >
        <Box sx={{ maxWidth: 650, mx: "auto", textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              border: 1,
              borderColor: "border.default",
              borderRadius: 99,
              bgcolor: "background.default",
              color: "secondary.main",
            }}
          >
            <IconSparkles size={14} aria-hidden />
            <Typography
              sx={{ fontSize: 10, letterSpacing: ".8px", fontWeight: 700 }}
            >
              MORE ROOM TO BUILD
            </Typography>
          </Box>
          <Typography
            component="h1"
            sx={{
              mt: 4,
              fontSize: { xs: 32, md: 46 },
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: "-1.5px",
            }}
          >
            Your next idea deserves Pro.
          </Typography>
          <Typography
            sx={{
              mt: 3,
              color: "text.secondary",
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            More headroom for growing projects, predictable pricing, and the
            tools to keep shipping.
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 8,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
            alignItems: "stretch",
          }}
        >
          <Box
            component="section"
            sx={{
              p: { xs: 5, md: 7 },
              border: 1,
              borderColor: "border.default",
              borderRadius: 1.5,
              bgcolor: "background.default",
            }}
          >
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 11,
                letterSpacing: ".8px",
                fontWeight: 700,
              }}
            >
              HOBBY
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 3 }}
            >
              <Typography sx={{ fontSize: 34, fontWeight: 800 }}>$0</Typography>
              <Typography sx={{ color: "text.disabled", fontSize: 12 }}>
                / month
              </Typography>
            </Box>
            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 12 }}>
              For trying out a new idea.
            </Typography>
            <Button
              component={NextLink}
              href={ACCOUNT_ROUTES.projects}
              variant="outlined"
              fullWidth
              sx={{ mt: 5, fontSize: 12 }}
            >
              Current plan
            </Button>
          </Box>

          <Box
            component="section"
            sx={{
              p: { xs: 5, md: 7 },
              border: 1,
              borderColor: "secondary.main",
              borderRadius: 1.5,
              bgcolor: "background.default",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 100% 0%, rgba(6,182,212,.14), transparent 58%)",
                pointerEvents: "none",
              }}
            />
            <Box sx={{ position: "relative" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    color: "secondary.main",
                    fontSize: 11,
                    letterSpacing: ".8px",
                    fontWeight: 700,
                  }}
                >
                  PRO
                </Typography>
                <Typography
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: "rgba(6,182,212,.12)",
                    color: "secondary.main",
                    borderRadius: 99,
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  MOST POPULAR
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 3 }}
              >
                <Typography sx={{ fontSize: 34, fontWeight: 800 }}>
                  $20
                </Typography>
                <Typography sx={{ color: "text.disabled", fontSize: 12 }}>
                  / month
                </Typography>
              </Box>
              <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 12 }}>
                For teams building for what&apos;s next.
              </Typography>
              <Button
                component={NextLink}
                href={ROUTES.signUp}
                variant="contained"
                fullWidth
                endIcon={<IconArrowRight size={15} />}
                sx={{ mt: 5, gap: 1, fontSize: 12 }}
              >
                Get started with Pro
              </Button>
              <Typography
                sx={{
                  mt: 2,
                  color: "text.disabled",
                  textAlign: "center",
                  fontSize: 10,
                }}
              >
                No commitment. Change or cancel anytime.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          component="section"
          aria-labelledby="compare-heading"
          sx={{ mt: 10 }}
        >
          <Typography
            id="compare-heading"
            component="h2"
            sx={{ mb: 3, fontSize: 18, fontWeight: 700 }}
          >
            Compare plans
          </Typography>
          <Box
            sx={{
              border: 1,
              borderColor: "border.default",
              borderRadius: 1.5,
              bgcolor: "background.default",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr 1fr",
                px: { xs: 3, md: 5 },
                py: 3,
                color: "text.disabled",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".6px",
              }}
            >
              <span>INCLUDED</span>
              <span>HOBBY</span>
              <span style={{ color: "#06B6D4" }}>PRO</span>
            </Box>
            <Divider />
            {FEATURES.map(([label, hobby, pro]) => (
              <Box
                key={label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr 1fr",
                  px: { xs: 3, md: 5 },
                  py: 3,
                  borderBottom: 1,
                  borderColor: "border.default",
                  "&:last-child": { borderBottom: 0 },
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                  {label}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                  {hobby}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "secondary.main",
                  }}
                >
                  <IconCheck size={13} aria-hidden />
                  <Typography sx={{ color: "text.primary", fontSize: 12 }}>
                    {pro}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography
          sx={{
            mt: 5,
            color: "text.disabled",
            fontSize: 10,
            textAlign: "center",
          }}
        >
          Plan selection is a static preview. Billing and checkout will be
          available soon.
        </Typography>
      </Box>
    </Box>
  );
}
