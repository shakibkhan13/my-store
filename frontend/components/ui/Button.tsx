"use client";

import { Button as MuiButton } from "@mui/material";
import type { ButtonProps as MuiButtonProps } from "@mui/material";

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
}

export default function Button({
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <MuiButton
      {...props}
      disabled={disabled || loading}
      sx={{
        textTransform: "none",
        borderRadius: "8px",
        fontWeight: 600,
        ...props.sx,
      }}
    >
      {loading ? "Loading..." : children}
    </MuiButton>
  );
}