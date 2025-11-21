// src/layouts/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookIcon from "@mui/icons-material/Book";
import SchoolIcon from "@mui/icons-material/School";
import CategoryIcon from "@mui/icons-material/Category";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Topics", icon: <CategoryIcon />, path: "/topics" },
  { text: "Lessons", icon: <SchoolIcon />, path: "/lessons" },
  { text: "Vocabularies", icon: <BookIcon />, path: "/vocabularies" },
  { text: "Achievements", icon: <EmojiEventsIcon />, path: "/achievements" },
  { text: "Users", icon: <PeopleIcon />, path: "/users" },
];
const navLinkStyle = {
  color: "var(--text-secondary)",
  textDecoration: "none",
  margin: "4px 8px",
  borderRadius: "8px",
};

const activeNavLinkStyle = {
  backgroundColor: "rgba(108, 92, 231, 0.1)", // Màu tím nhạt
  color: "var(--primary-accent)", // Màu tím đậm
  fontWeight: "bold",
};
function Sidebar() {
  return (
    <Box
      sx={{
        width: 250,
        height: "100%", // <-- Thêm dòng này
        bgcolor: "var(--background-sidebar)",
        borderRight: "1px solid var(--border-color)",
        p: 1,
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "var(--primary-accent)" }}
        >
          BearEnglish
        </Typography>
        <Typography variant="caption">Admin</Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <NavLink
            key={item.text}
            to={item.path}
            style={({ isActive }) => ({
              ...navLinkStyle,
              ...(isActive ? activeNavLinkStyle : {}),
            })}
          >
            <ListItem disablePadding>
              <ListItemButton sx={{ borderRadius: "8px" }}>
                <ListItemIcon sx={{ color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </NavLink>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;
