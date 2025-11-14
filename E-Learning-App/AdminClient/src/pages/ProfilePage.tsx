// src/pages/ProfilePage.tsx
import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { PageHeader } from "../components/ui/PageHeader";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import ProfileDetails from "../components/profile/ProfileDetails";
import ChangePassword from "../components/profile/ChangePassword";
import { AccountCircle } from "@mui/icons-material";

const ProfilePage: React.FC = () => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <PageHeader
          title="Tài khoản"
          subtitle="Quản lý thông tin cá nhân và bảo mật"
          buttonText="Cập nhật"
          onButtonClick={() => console.log("clicked")}
          icon={<AccountCircle />}
        />
        <Grid container spacing={3}>
          <Grid sx={{ xs: 12, sm: 6, md: 4 }}>
            <ProfileAvatar />
          </Grid>
          <Grid sx={{ xs: 12, sm: 6, md: 8 }}>
            <ProfileDetails />
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <ChangePassword />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProfilePage;
