// src/components/PageHeader.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// Thêm interface để định nghĩa kiểu cho props
interface PageHeaderProps {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
  icon: React.ReactNode;
}

export function PageHeader({
  title,
  buttonText,
  onButtonClick,
  icon,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: "bold",
        }}
      >
        {icon} {title}
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onButtonClick}
      >
        {buttonText}
      </Button>
    </Box>
  );
}
