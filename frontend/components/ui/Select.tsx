"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
} from "@mui/material";

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  disabled?: boolean;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: SelectProps) {
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>

      <MuiSelect
        value={value}
        label={label}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          borderRadius: "8px",
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}