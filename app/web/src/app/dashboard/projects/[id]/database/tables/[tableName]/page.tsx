import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NextLink from "next/link";
import {
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import {
  IconArrowLeft,
  IconDatabase,
  IconPlus,
} from "@tabler/icons-react";
import {
  getDatabaseOverview,
  projectTablesBase,
  SURFACE,
} from "@/features/database";

interface PageProps {
  params: Promise<{ id: string; tableName: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tableName } = await params;
  return { title: `Table: ${decodeURIComponent(tableName)}` };
}

export default async function TableDetailPage({ params }: PageProps) {
  const { id, tableName: rawTableName } = await params;
  const tableName = decodeURIComponent(rawTableName);
  const data = await getDatabaseOverview(id);
  if (!data) notFound();

  const table = data.tables.find(
    (t) => t.name.toLowerCase() === tableName.toLowerCase(),
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="nav"
          aria-label="Breadcrumb"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <NextLink
            href={projectTablesBase(id)}
            style={{ textDecoration: "none" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                fontSize: 13,
                "&:hover": {
                  textDecoration: "underline",
                  color: "text.primary",
                },
              }}
            >
              Database
            </Typography>
          </NextLink>
          <Typography
            variant="body2"
            sx={{ color: "text.disabled", fontSize: 13 }}
            aria-hidden
          >
            /
          </Typography>
          <NextLink
            href={projectTablesBase(id)}
            style={{ textDecoration: "none" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                fontSize: 13,
                "&:hover": {
                  textDecoration: "underline",
                  color: "text.primary",
                },
              }}
            >
              Tables
            </Typography>
          </NextLink>
          <Typography
            variant="body2"
            sx={{ color: "text.disabled", fontSize: 13 }}
            aria-hidden
          >
            /
          </Typography>
          <Typography
            variant="body2"
            aria-current="page"
            sx={{ color: "text.primary", fontSize: 13, fontWeight: 500 }}
          >
            {tableName}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 3,
            mt: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              component="span"
              sx={{ display: "flex", color: "secondary.main" }}
            >
              <IconDatabase size={24} aria-hidden />
            </Box>
            <Typography variant="h4" component="h1">
              {tableName}
            </Typography>
            {table && (
              <Chip
                label={table.rls === "active" ? "RLS Active" : "RLS Disabled"}
                size="small"
                sx={{
                  bgcolor:
                    table.rls === "active"
                      ? "statusBackground.success"
                      : "statusBackground.primary",
                  color:
                    table.rls === "active" ? "success.main" : "secondary.main",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <NextLink
              href={projectTablesBase(id)}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="outlined"
                startIcon={<IconArrowLeft size={16} />}
                sx={{
                  height: 38,
                  borderRadius: "6px",
                  fontSize: 13,
                  borderColor: "border.default",
                  color: "text.secondary",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "border.strong",
                    bgcolor: "background.elevated",
                  },
                }}
              >
                Back to Tables
              </Button>
            </NextLink>
            <Button
              variant="contained"
              startIcon={<IconPlus size={16} />}
              sx={{
                height: 38,
                borderRadius: "6px",
                fontSize: 13,
                textTransform: "none",
              }}
            >
              Insert Row
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: SURFACE,
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: "12px",
          p: 4,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
            Table Metadata
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 4,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", textTransform: "uppercase" }}
              >
                Rows
              </Typography>
              <Typography
                variant="code"
                sx={{
                  display: "block",
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: 16,
                  mt: 0.5,
                }}
              >
                {table ? table.rows.toLocaleString() : "0"}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", textTransform: "uppercase" }}
              >
                Size
              </Typography>
              <Typography
                variant="code"
                sx={{
                  display: "block",
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: 16,
                  mt: 0.5,
                }}
              >
                {table ? table.size : "0 KB"}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", textTransform: "uppercase" }}
              >
                Last Modified
              </Typography>
              <Typography
                sx={{
                  display: "block",
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: 14,
                  mt: 0.5,
                }}
              >
                {table ? table.lastModified : "Never"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
