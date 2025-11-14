// src/components/profile/ProfileAvatar.tsx
import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const ProfileAvatar: React.FC = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Avatar
            src={user?.avatar}
            sx={{
              height: 80,
              mb: 2,
              width: 80,
              fontSize: "2.5rem",
              bgcolor: "primary.main",
            }}
          >
            {user?.fullName?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography gutterBottom variant="h5">
            {user?.fullName}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {user?.email}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text" component="label">
          Tải ảnh lên
          <input type="file" hidden accept="image/*" />
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProfileAvatar;
