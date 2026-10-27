import { Box, Typography } from "@mui/material";
import { IconCheck } from "@tabler/icons-react";
import { DASHBOARD, DASHBOARD_MENU, USER_ROWS } from "@/constants/homePage";
import { SDK_INIT_CODE } from "@/config/snippets";
import { fontFamily, monoLabel, mq } from "@/theme/tokens";
import { CodeBlock, Panel } from "../../common";

const dot = (color: string, size = 7) =>
  ({
    width: size,
    height: size,
    borderRadius: "50%",
    bgcolor: color,
    flex: "none",
  }) as const;

const mono = { fontFamily: fontFamily.mono } as const;
const COLS = "36px minmax(0, 1fr) 64px";

function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "0 0 240px",
        width: 240,
        py: 5,
        px: 4,
        borderRight: 1,
        borderColor: "border.default",
        bgcolor: "background.elevated",
        [mq.mobile]: {
          flex: "0 0 auto",
          width: "auto",
          p: 3,
          borderRight: 0,
          borderBottom: 1,
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: "flex",
          gap: 2,
          px: 1,
          pb: 6,
          [mq.mobile]: { px: 0.5, pb: 0 },
        }}
      >
        <Box sx={dot("error.main", 10)} />
        <Box sx={dot("warning.main", 10)} />
        <Box sx={dot("success.main", 10)} />
      </Box>

      <Box
        component="nav"
        aria-label="Dashboard preview"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          [mq.mobile]: {
            flexDirection: "row",
            overflowX: "auto",
            gap: 1,
            pt: 3,
          },
        }}
      >
        {DASHBOARD_MENU.map(({ label, icon: Icon, href, active }) => (
          <Box
            key={label}
            component="a"
            href={href}
            aria-current={active ? "page" : undefined}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.75,
              height: 34,
              px: 2.25,
              borderRadius: 0.75,
              color: active ? "common.white" : "text.secondary",
              bgcolor: active ? "primary.main" : "transparent",
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              textDecoration: "none",
              "&:hover": {
                bgcolor: active ? "primary.main" : "border.default",
              },
              [mq.mobile]: { flex: "0 0 auto", gap: 1.5, px: 2, fontSize: 10 },
            }}
          >
            <Icon size={16} aria-hidden />
            {label}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mt: "auto",
          pt: 3,
          px: 1.5,
          color: "text.disabled",
          fontSize: 10,
          [mq.mobile]: { display: "none" },
        }}
      >
        <Box sx={dot("success.main")} />
        {DASHBOARD.systemStatus}
      </Box>
    </Box>
  );
}

function UsersTable() {
  return (
    <Panel
      surface="raised"
      sx={{ minWidth: 0, p: 3.75, [mq.mobile]: { minHeight: 220 } }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3.5,
          color: "secondary.main",
          fontSize: 11,
          ...mono,
        }}
      >
        <span>{DASHBOARD.tableName}</span>
        <span aria-hidden>•••</span>
      </Box>

      <Box
        role="table"
        aria-label={DASHBOARD.tableName}
        sx={{ ...mono, fontSize: 10 }}
      >
        <Box
          role="row"
          sx={{
            display: "grid",
            gridTemplateColumns: COLS,
            gap: 2,
            alignItems: "center",
            px: 2,
            py: 2.75,
            borderBottom: 1,
            borderColor: "border.default",
            color: "text.disabled",
            fontSize: 9,
            textTransform: "uppercase",
          }}
        >
          {DASHBOARD.tableColumns.map((c) => (
            <span role="columnheader" key={c}>
              {c}
            </span>
          ))}
        </Box>
        {USER_ROWS.map(({ id, email, status }) => (
          <Box
            role="row"
            key={id}
            sx={{
              display: "grid",
              gridTemplateColumns: COLS,
              gap: 2,
              alignItems: "center",
              px: 2,
              py: 2.75,
              borderBottom: 1,
              borderColor: "border.default",
              color: "text.secondary",
            }}
          >
            <span role="cell">{id.padStart(2, "0")}</span>
            <Box
              component="span"
              role="cell"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </Box>
            <Box
              component="span"
              role="cell"
              sx={{
                color: status === "Verified" ? "success.main" : "warning.main",
              }}
            >
              {status}
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: 3,
          px: 0.75,
          color: "text.disabled",
          fontSize: 9,
          ...mono,
        }}
      >
        <span>{DASHBOARD.totalRows}</span>
        <span aria-hidden>←&nbsp; 1 &nbsp;2 &nbsp;3 &nbsp;→</span>
      </Box>
    </Panel>
  );
}

function SdkCard() {
  return (
    <Panel
      surface="base"
      outline="primary"
      sx={{ minWidth: 0, p: 3.75, [mq.mobile]: { display: "none" } }}
    >
      <Box
        sx={{ mb: 3.25, color: "text.disabled", fontSize: 10, ...monoLabel }}
      >
        {DASHBOARD.codeLabel}
      </Box>
      <CodeBlock lines={SDK_INIT_CODE} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mt: 4,
          color: "success.main",
          fontSize: 10,
        }}
      >
        <IconCheck size={14} aria-hidden />
        {DASHBOARD.codeSuccess}
      </Box>
    </Panel>
  );
}

export function DashboardPreview() {
  return (
    <Panel
      aria-label="DevStack dashboard preview"
      radius={1.5}
      sx={{
        display: "flex",
        width: "min(1120px, 100%)",
        minHeight: 460,
        overflow: "hidden",
        boxShadow: "0 30px 90px rgb(0 0 0 / 28%)",
        [mq.mobile]: { minHeight: 0, flexDirection: "column" },
      }}
    >
      <Sidebar />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          gap: 5.5,
          p: 7,
          [mq.mobile]: { gap: 4, py: 4.25, px: 3.25 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                mb: 1.25,
                fontSize: 19,
                fontWeight: 600,
                lineHeight: 1.35,
                [mq.mobile]: { fontSize: 15 },
              }}
            >
              {DASHBOARD.title}
            </Typography>
            <Typography
              color="text.disabled"
              sx={{ fontSize: 11, [mq.mobile]: { fontSize: 9 } }}
            >
              {DASHBOARD.region}
              <Box component="span" sx={{ px: 1 }}>
                ·
              </Box>
              {DASHBOARD.status}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.75,
              px: 2.25,
              py: 1,
              border: 1,
              borderColor: "primary.main",
              borderRadius: "99px",
              bgcolor: "statusBackground.primary",
              color: "secondary.main",
              fontSize: 10,
              textTransform: "uppercase",
              ...mono,
            }}
          >
            <Box sx={{ ...dot("secondary.main", 6) }} />
            {DASHBOARD.syncLabel}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            flex: 1,
            minHeight: 0,
            gap: 4,
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(240px, .95fr)",
            [mq.mobile]: { gridTemplateColumns: "1fr" },
          }}
        >
          <UsersTable />
          <SdkCard />
        </Box>
      </Box>
    </Panel>
  );
}
