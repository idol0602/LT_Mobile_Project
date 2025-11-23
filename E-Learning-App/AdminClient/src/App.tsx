// src/App.tsx
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
import UsersPage from "./pages/user/UsersPage";
import AchievementsPage from "./pages/Achievement/AchievementsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import UnverifiedPage from "./pages/auth/UnverifiedPage";

// 3. Import Auth context và Protected Route
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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

// Cấu hình router
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/unverified",
    element: <UnverifiedPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "vocabularies", element: <VocabulariesPage /> },
      { path: "topics", element: <TopicsPage /> },
      { path: "lessons", element: <LessonPage /> },
      { path: "achievements", element: <AchievementsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);

function App() {
  return (
    // 4. Bọc toàn bộ ứng dụng trong AuthProvider và ThemeProvider
    <AuthProvider>
      <ThemeProvider theme={theme}>
        {/* CssBaseline giúp reset CSS và áp dụng font, background từ theme */}
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
