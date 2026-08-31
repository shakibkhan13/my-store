"use client";

import { CircularProgress, Box } from "@mui/material";

interface LoaderProps {
  size?: number;
  fullScreen?: boolean;
}

export default function Loader({
  size = 30,
  fullScreen = false,
}: LoaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(fullScreen && {
          minHeight: "60vh",
        }),
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
}