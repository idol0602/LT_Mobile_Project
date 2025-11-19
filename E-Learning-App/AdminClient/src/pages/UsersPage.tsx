import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { PageHeader } from "../components/ui/PageHeader";

interface User {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: "user" | "admin";
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://192.168.1.52:5050";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form state for editing
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    role: "user" as "user" | "admin",
  });

  // Form state for creating admin
  const [createAdminForm, setCreateAdminForm] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data || []);
      setError("");
    } catch (err) {
      setError("Không thể tải danh sách người dùng");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/users/${selectedUser._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((u) => u._id !== selectedUser._id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError("Không thể xóa người dùng");
      console.error("Error deleting user:", err);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const data = await response.json();
      setUsers(users.map((u) => (u._id === selectedUser._id ? data.data : u)));
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError("Không thể cập nhật người dùng");
      console.error("Error updating user:", err);
    }
  };

  const handleToggleVerification = async (user: User) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/users/${user._id}/toggle-verification`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle verification");
      }

      const data = await response.json();
      setUsers(users.map((u) => (u._id === user._id ? data.data : u)));
    } catch (err) {
      setError("Không thể thay đổi trạng thái xác thực");
      console.error("Error toggling verification:", err);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/users/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createAdminForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create admin");
      }

      const data = await response.json();

      // Nếu không gửi được email, hiển thị mật khẩu tạm thời
      if (data.data.temporaryPassword) {
        setSuccessMessage(
          `Tạo tài khoản thành công! Mật khẩu tạm thời: ${data.data.temporaryPassword}`
        );
      } else {
        setSuccessMessage(data.message);
      }

      // Reset form và đóng dialog
      setCreateAdminForm({ email: "", fullName: "", phoneNumber: "" });
      setCreateAdminDialogOpen(false);

      // Refresh danh sách users
      fetchUsers();

      // Xóa success message sau 10 giây
      setTimeout(() => setSuccessMessage(""), 10000);
    } catch (err: any) {
      setError(err.message || "Không thể tạo tài khoản admin");
      console.error("Error creating admin:", err);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Quản lý tài khoản và phân quyền người dùng"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setCreateAdminDialogOpen(true)}
          sx={{
            bgcolor: "success.main",
            "&:hover": { bgcolor: "success.dark" },
          }}
        >
          Tạo Admin
        </Button>
        <Button variant="outlined" onClick={fetchUsers}>
          Làm mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Đăng nhập cuối</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>
                  <Avatar
                    src={user.avatar}
                    alt={user.fullName}
                    sx={{ width: 40, height: 40 }}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">
                    {user.fullName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{user.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {user.phoneNumber ? (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {user.phoneNumber}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role === "admin" ? "Admin" : "User"}
                    color={user.role === "admin" ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={user.isVerified ? <CheckCircleIcon /> : <BlockIcon />}
                    label={user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                    color={user.isVerified ? "success" : "warning"}
                    size="small"
                    onClick={() => handleToggleVerification(user)}
                    sx={{ cursor: "pointer" }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(user.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {user.lastLogin ? formatDate(user.lastLogin) : "-"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => openEditDialog(user)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => openDeleteDialog(user)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count}`
          }
        />
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 400 }}>
          <TextField
            fullWidth
            label="Họ tên"
            value={editForm.fullName}
            onChange={(e) =>
              setEditForm({ ...editForm, fullName: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            value={editForm.phoneNumber}
            onChange={(e) =>
              setEditForm({ ...editForm, phoneNumber: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Vai trò"
            value={editForm.role}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                role: e.target.value as "user" | "admin",
              })
            }
            SelectProps={{
              native: true,
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleEditUser}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng{" "}
            <strong>{selectedUser?.fullName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog
        open={createAdminDialogOpen}
        onClose={() => setCreateAdminDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo tài khoản Admin mới</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mật khẩu sẽ được tự động tạo và gửi qua email.
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            required
            value={createAdminForm.email}
            onChange={(e) =>
              setCreateAdminForm({ ...createAdminForm, email: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Họ tên"
            required
            value={createAdminForm.fullName}
            onChange={(e) =>
              setCreateAdminForm({
                ...createAdminForm,
                fullName: e.target.value,
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            value={createAdminForm.phoneNumber}
            onChange={(e) =>
              setCreateAdminForm({
                ...createAdminForm,
                phoneNumber: e.target.value,
              })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Lưu ý:</strong> Mật khẩu ngẫu nhiên sẽ được tạo và gửi qua
              email. Admin mới nên đổi mật khẩu ngay sau khi đăng nhập lần đầu.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAdminDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreateAdmin}
            disabled={!createAdminForm.email || !createAdminForm.fullName}
          >
            Tạo tài khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
