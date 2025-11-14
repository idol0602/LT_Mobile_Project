// src/pages/auth/VerifyEmailPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import { verifyEmail } from "../../services/authApi";
import { useAuth } from "../../contexts/AuthContext";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Không tìm thấy token xác nhận.");
      return;
    }

    const doVerification = async () => {
      try {
        const response = await verifyEmail(token);
        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
        } else {
          setStatus("error");
          setMessage(
            response.data.message || "Token không hợp lệ hoặc đã hết hạn."
          );
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Lỗi server khi xác nhận email."
        );
      }
    };

    doVerification();
  }, [searchParams]);

  const handleRedirect = () => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F4F5F7 0%, #E0E0E0 100%)",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          {status === "loading" && (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">Đang xác nhận email...</Typography>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircleOutline
                color="success"
                sx={{ fontSize: 60, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                Xác nhận thành công!
              </Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRedirect}
              >
                {isAuthenticated ? "Về trang chủ" : "Đến trang đăng nhập"}
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Xác nhận thất bại
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/"
              >
                Về trang chủ
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
