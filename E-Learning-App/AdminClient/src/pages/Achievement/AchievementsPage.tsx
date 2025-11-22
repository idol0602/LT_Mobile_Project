"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  type ChipProps,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { AchievementFormModal } from "../../components/achievement/AchievementFormModal";
import {
  getAllAchievements,
  deleteAchievement,
  createAchievement,
  updateAchievement,
  type Achievement,
} from "../../services/achievementApi";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] =
    useState<Achievement | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAchievements({ includeHidden: true });
      setAchievements(response.data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch achievements");
      showSnackbar("Failed to fetch achievements", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelectedAchievement(null);
    setModalOpen(true);
  };

  const handleEdit = (achievement: Achievement) => {
    setModalMode("edit");
    setSelectedAchievement(achievement);
    setModalOpen(true);
  };

  const handleSave = async (achievementData: Partial<Achievement>) => {
    try {
      if (modalMode === "create") {
        await createAchievement(achievementData);
        showSnackbar("Achievement created successfully!", "success");
      } else if (selectedAchievement?._id) {
        await updateAchievement(selectedAchievement._id, achievementData);
        showSnackbar("Achievement updated successfully!", "success");
      }
      setModalOpen(false);
      fetchAchievements();
    } catch (err: any) {
      showSnackbar(err.message || "Failed to save achievement", "error");
    }
  };

  const handleDeleteClick = (achievement: Achievement) => {
    setAchievementToDelete(achievement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!achievementToDelete?._id) return;

    try {
      await deleteAchievement(achievementToDelete._id);
      showSnackbar("Achievement deleted successfully!", "success");
      setDeleteDialogOpen(false);
      setAchievementToDelete(null);
      fetchAchievements();
    } catch (err: any) {
      showSnackbar(err.message || "Failed to delete achievement", "error");
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDifficultyColor = (difficulty: string): ChipProps["color"] => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "normal":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string): ChipProps["color"] => {
    switch (type) {
      case "first":
        return "secondary";
      case "progress":
        return "primary";
      case "vocab":
        return "info";
      case "streak":
        return "error";
      default:
        return "default";
    }
  };

  const getConditionSummary = (achievement: Achievement): string => {
    if (!achievement.conditions || achievement.conditions.length === 0) {
      return "No conditions";
    }

    return achievement.conditions
      .map((cond) => {
        const valueStr = Array.isArray(cond.value)
          ? `[${cond.value.join(", ")}]`
          : cond.value;
        return `${cond.key} ${cond.operator} ${valueStr}`;
      })
      .join(" AND ");
  };

  const paginatedAchievements = achievements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" fontWeight="bold">
            Achievements Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Achievement
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Total Achievements
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {achievements.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Easy
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            {achievements.filter((a) => a.difficulty === "easy").length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Normal
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="warning.main">
            {achievements.filter((a) => a.difficulty === "normal").length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Hard
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="error.main">
            {achievements.filter((a) => a.difficulty === "hard").length}
          </Typography>
        </Paper>
      </Box>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "primary.light" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Icon</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Difficulty
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Conditions
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hidden</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAchievements.map((achievement) => (
                    <TableRow key={achievement._id} hover>
                      <TableCell>
                        <Typography variant="h5">{achievement.icon}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {achievement.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {achievement.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={achievement.type}
                          size="small"
                          color={getTypeColor(achievement.type)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={achievement.difficulty}
                          size="small"
                          color={getDifficultyColor(achievement.difficulty)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getConditionSummary(achievement)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {achievement.hidden ? (
                          <Chip label="Hidden" size="small" color="default" />
                        ) : (
                          <Chip label="Visible" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(achievement)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(achievement)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={achievements.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Form Modal */}
      <AchievementFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        achievement={selectedAchievement}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the achievement "
            {achievementToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
