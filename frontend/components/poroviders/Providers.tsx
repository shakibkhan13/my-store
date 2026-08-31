"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { type ReactElement } from "react";

import { MotionProvider } from "./motion-providers";

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />

      <MotionProvider>
        {children}
      </MotionProvider>
    </ThemeProvider>
  );
}