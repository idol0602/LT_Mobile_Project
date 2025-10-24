// src/layouts/DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material"; // 1. Import Toolbar
import Sidebar from "./Sidebar";
import { Header } from "../components/Header"; // 2. Import Header

// Định nghĩa chiều rộng của Sidebar để tái sử dụng
const SIDEBAR_WIDTH = 250;

function DashboardLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* SIDEBAR CỐ ĐỊNH (Không đổi) */}
      <Box
        component="aside"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
        }}
      >
        <Sidebar />
      </Box>

      {/* KHU VỰC CHỨA HEADER VÀ NỘI DUNG CHÍNH */}
      <Box
        component="div" // Đổi thành div để chứa cả Header và Main
        sx={{
          flexGrow: 1,
          marginLeft: `${SIDEBAR_WIDTH}px`, // Đẩy toàn bộ khu vực sang phải
          height: "100vh",
          display: "flex",
          flexDirection: "column", // Xếp Header và Main theo chiều dọc
        }}
      >
        {/* 3. Render Header */}
        <Header sidebarWidth={SIDEBAR_WIDTH} />

        {/* KHU VỰC NỘI DUNG CHÍNH (CÓ THỂ CUỘN) */}
        <Box
          component="main"
          sx={{
            flexGrow: 1, // Chiếm không gian còn lại
            // Thêm padding top bằng chiều cao của header (thường là 64px) + padding mong muốn (p: 4 = 32px)
            pt: `calc(64px + 32px)`,
            px: 4, // Padding ngang
            pb: 4, // Padding dưới
            overflow: "auto", // Chỉ cho phép khu vực này cuộn
          }}
        >
          {/* Không cần Toolbar ở đây nữa vì đã dùng padding-top */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
