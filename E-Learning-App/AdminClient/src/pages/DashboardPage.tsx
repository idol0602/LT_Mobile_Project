import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";

function DashboardPage() {
  const stats = [
    { label: "Tổng số từ vựng", value: 245 },
    { label: "Bài học đã tạo", value: 32 },
    { label: "Người dùng", value: 1780 },
  ];

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 6,
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #088395, #00B8A9)",
          color: "white",
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          👋 Chào mừng đến với Bảng điều khiển học tiếng Anh
        </Typography>
        <Typography variant="subtitle1" mt={1}>
          Quản lý và theo dõi tiến trình học tập của bạn
        </Typography>
      </Box>

      {/* Dùng Tailwind grid thay cho MUI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item, i) => (
          <Card
            key={i}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              backgroundColor: "white",
              border: "1px solid #E0E7EF",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" color="#088395" fontWeight={600}>
                {item.label}
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ mt: 1, color: "#1E293B" }}
              >
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </Box>
  );
}

export default DashboardPage;
