import { Box, Button, Divider } from "@mui/material";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandWindows,
} from "@tabler/icons-react";

export default function OAuthButtons() {
  const providers = [
    { name: "Google", icon: <IconBrandGoogle size={18} /> },
    { name: "GitHub", icon: <IconBrandGithub size={18} /> },
    { name: "Microsoft", icon: <IconBrandWindows size={18} /> },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Divider
        sx={{
          color: "text.secondary",
          fontSize: 12,
          "&::before, &::after": {
            borderColor: "border.default",
          },
        }}
      >
        OR CONTINUE WITH
      </Divider>

      <Box sx={{ display: "flex", gap: 3 }}>
        {providers.map((provider) => (
          <Button
            key={provider.name}
            type="button"
            variant="outlined"
            fullWidth
            startIcon={provider.icon}
            onClick={() => {}}
            sx={{
              minWidth: 0,
              minHeight: 42,
              px: 2,
              color: "common.white",
              borderColor: "border.default",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            {provider.name}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
