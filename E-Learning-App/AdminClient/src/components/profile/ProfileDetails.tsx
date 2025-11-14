// src/components/profile/ProfileDetails.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "../../services/authApi";

const ProfileDetails: React.FC = () => {
  const { user, loading, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      });

      if (response.data.success) {
        setSuccess("Cập nhật thông tin thành công!");
        // Update user in AuthContext
        updateUser({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
        });
      } else {
        setError(response.data.message || "Cập nhật thất bại.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          subheader="Bạn có thể chỉnh sửa thông tin cá nhân tại đây"
          title="Thông tin cá nhân"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid sx={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                onChange={handleChange}
                required
                value={formData.fullName}
                variant="outlined"
              />
            </Grid>
            <Grid sx={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phoneNumber"
                onChange={handleChange}
                value={formData.phoneNumber}
                variant="outlined"
              />
            </Grid>
            <Grid sx={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Địa chỉ Email"
                name="email"
                value={formData.email}
                variant="outlined"
                disabled
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 2,
          }}
        >
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Card>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </form>
  );
};

export default ProfileDetails;
