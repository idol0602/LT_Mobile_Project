// src/layouts/Header.tsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  InputBase,
  Menu,
  MenuItem,
  ListItemIcon, // Import các component cần thiết cho Menu
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle"; // Icon cho Profile
import Logout from "@mui/icons-material/Logout"; // Icon cho Logout

// --- Các styled components cho Search bar (Giữ nguyên) ---
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));
// --- Kết thúc styled components ---

interface HeaderProps {
  sidebarWidth: number;
}

export function Header({ sidebarWidth }: HeaderProps) {
  // --- State quản lý trạng thái mở/đóng và vị trí của Menu ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // --- Các hàm xử lý sự kiện cho Menu ---
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Mở menu tại vị trí click
  };
  const handleClose = () => {
    setAnchorEl(null); // Đóng menu
  };

  // --- Các hàm xử lý hành động khi chọn item trong Menu (Tạm thời) ---
  const handleProfile = () => {
    console.log("Chuyển đến trang Profile");
    handleClose();
  };
  const handleLogout = () => {
    console.log("Thực hiện đăng xuất");
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${sidebarWidth}px)`,
        ml: `${sidebarWidth}px`,
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar>
        {/* Tiêu đề (có thể làm động sau) */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
        >
          Dashboard
        </Typography>

        {/* Thanh tìm kiếm (Giữ nguyên) */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon fontSize="small" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
        </Search>

        {/* Khu vực Icon bên phải */}
        <Box
          sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 1 }}
        >
          {/* Avatar có thể click để mở menu */}
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            {/* Thay src bằng avatar người dùng thật */}
            <Avatar
              sx={{ width: 32, height: 32 }}
              alt="User Name"
              src="/static/images/avatar/2.jpg"
            />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Menu Dropdown cho Avatar */}
      <Menu
        anchorEl={anchorEl} // Vị trí menu sẽ xuất hiện (dưới IconButton)
        id="account-menu"
        open={open} // Trạng thái mở/đóng
        onClose={handleClose} // Hàm xử lý khi click ra ngoài để đóng menu
        onClick={handleClose} // Đóng menu khi click vào một MenuItem
        PaperProps={{
          // Tùy chỉnh giao diện của Menu
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))", // Đổ bóng nhẹ
            mt: 1.5, // Khoảng cách với Avatar
            "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
            "&:before": {
              // Tạo mũi tên nhỏ chỉ lên avatar
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
