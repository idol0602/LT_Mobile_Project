// src/components/PageHeader.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// Thêm interface để định nghĩa kiểu cho props
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
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
      <Box>
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
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {buttonText && onButtonClick && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
}
