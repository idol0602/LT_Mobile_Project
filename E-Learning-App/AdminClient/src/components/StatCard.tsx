// src/components/stat-card.tsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import type { ElementType } from "react";

// Định nghĩa kiểu dữ liệu cho các props mà StatCard sẽ nhận
interface StatCardProps {
  icon: ElementType;
  label: string;
  value: number | string;
  color: string;
}

export function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Vòng tròn chứa icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}20`, // Sử dụng màu sắc được truyền vào với độ mờ 20%
            }}
          >
            <Icon style={{ color: color, width: 22, height: 22 }} />
          </Box>
          {/* Nội dung text */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
