// src/App.tsx
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// 1. Import các component cần thiết từ MUI
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// 2. Import các trang và layout của bạn
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import VocabulariesPage from "./pages/vocabulary/VocabulariesPage";
import TopicsPage from "./pages/TopicsPage";
import LessonPage from "./pages/LessonPage";
// 3. Tạo một theme tùy chỉnh 🎨
// Bạn có thể tùy chỉnh màu sắc, font chữ, và nhiều thứ khác ở đây.
const theme = createTheme({
  palette: {
    primary: {
      main: "#088395", // Màu xanh chủ đạo
    },
    secondary: {
      main: "#00B8A9", // Màu xanh phụ
    },
    background: {
      default: "#F4F5F7", // Màu nền chính
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Bỏ viết hoa chữ trên nút
          borderRadius: 8,
        },
      },
    },
  },
});

// Cấu hình router (không đổi)
const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "vocabularies", element: <VocabulariesPage /> },
      { path: "topics", element: <TopicsPage /> },
      { path: "lessons", element: <LessonPage /> },
    ],
  },
]);

function App() {
  return (
    // 4. Bọc toàn bộ ứng dụng trong ThemeProvider
    <ThemeProvider theme={theme}>
      {/* CssBaseline giúp reset CSS và áp dụng font, background từ theme */}
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
