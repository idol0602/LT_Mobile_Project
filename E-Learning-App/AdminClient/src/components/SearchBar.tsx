// src/components/SearchBar.tsx
import React from "react";
import { Paper, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// 1. Định nghĩa một "interface" để mô tả các props
interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const searchBoxStyles = {
  p: 2,
  mb: 2,
  border: "1px solid #E0E7EF",
  borderRadius: 3,
  backgroundColor: "white",
};

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "& fieldset": { borderColor: "#D0D8E0" },
    "&:hover fieldset": { borderColor: "#088395" },
  },
};

// 2. Áp dụng interface đã định nghĩa cho các props
function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <Paper elevation={0} sx={searchBoxStyles}>
      <TextField
        fullWidth
        placeholder={placeholder}
        variant="outlined"
        value={value}
        onChange={onChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#9AA6B2" }} />
            </InputAdornment>
          ),
        }}
        sx={textFieldStyles}
      />
    </Paper>
  );
}

export default SearchBar;
