// src/pages/auth/UnverifiedPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { resendVerification } from "../../services/authApi";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

const UnverifiedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResendEmail = async () => {
    if (!user?.email) {
      setError("Không tìm thấy địa chỉ email của bạn.");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await resendVerification(user.email);
      setMessage(response.data.message);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đã xảy ra lỗi khi gửi lại email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
        }}
      >
        <MarkEmailReadIcon sx={{ fontSize: 60, color: "primary.main" }} />
        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          Xác nhận địa chỉ Email của bạn
        </Typography>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body1">
            Cảm ơn bạn đã đăng ký! Một email xác nhận đã được gửi đến{" "}
            <strong>{user?.email}</strong>.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) và nhấp vào liên
            kết để hoàn tất việc xác minh.
          </Typography>
        </Box>
        {message && (
          <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 1 }}
          onClick={handleResendEmail}
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Gửi lại Email xác nhận"}
        </Button>
        <Button fullWidth variant="outlined" onClick={logout}>
          Đăng xuất
        </Button>
      </Paper>
    </Container>
  );
};

export default UnverifiedPage;
