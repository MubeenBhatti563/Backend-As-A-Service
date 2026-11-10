"use client";

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { IconLock } from "@tabler/icons-react";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { useChangePassword } from "@/features/auth";
import type { ChangePasswordValues } from "@/features/auth/schemas/auth.schema";

export function PasswordItem() {
  const [open, setOpen] = useState(false);
  const changePassword = useChangePassword();

  const handleSubmit = async (values: ChangePasswordValues) => {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconLock size={16} color="#94A3B8" aria-hidden />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              Password
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
              Set a secure password using argon2id hashing
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            height: 32,
            fontSize: 12,
            textTransform: "none",
            borderColor: "border.strong",
            color: "text.primary",
            "&:hover": {
              borderColor: "text.secondary",
              bgcolor: "background.elevated",
            },
          }}
        >
          Change password
        </Button>
      </Box>

      <ChangePasswordDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
