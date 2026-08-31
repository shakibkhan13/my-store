"use client";

import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

export default function Input(props: TextFieldProps) {
  return (
    <TextField
      fullWidth
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
        },
        ...props.sx,
      }}
    />
  );
}