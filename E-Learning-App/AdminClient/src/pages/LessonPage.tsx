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
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  TextField,
  InputLabel,
  // 1. Import các component cho Bảng
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Alert as MuiAlert,
  type SelectChangeEvent,
  type ChipProps,
  type AlertProps,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School"; // Icon cho tiêu đề
import FilterListIcon from "@mui/icons-material/FilterList"; // Icon cho bộ lọc
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { LessonWizardModal } from "../components/lesson/lessonWizardModal/LessonWizardModal";
import { LessonImportModal } from "../components/lesson/LessonImportModal";
import {
  getLessons,
  deleteLesson,
  type GetLessonsParams,
} from "../services/lessonApi";
import { VocabLessonModal } from "../components/lesson/EditVocabModal";
import { EditReadingModal } from "../components/lesson/EditReadingModal";
import { EditGrammarModal } from "../components/lesson/EditGrammarModal";
import { EditListeningModal } from "../components/lesson/EditListeningModal";
import type { Lesson as LessonData } from "../types/Lesson";
// 2. Định nghĩa kiểu dữ liệu Lesson đầy đủ
interface Lesson extends LessonData {
  _id: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  type: "vocab" | "listen" | "grammar" | "reading";
}

export default function LessonPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States cho Modal
  const [openWizard, setOpenWizard] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [openVocabModal, setOpenVocabModal] = useState(false);
  const [openReadingModal, setOpenReadingModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [openGrammarModal, setOpenGrammarModal] = useState(false);
  const [openListeningModal, setOpenListeningModal] = useState(false);
  // States cho Lọc và Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // 3. Thêm state cho Phân trang
  const [page, setPage] = useState(0); // MUI TablePagination là 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0); // 👈 Mới: Lấy tổng số từ server
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // State cho Debounce (trì hoãn tìm kiếm)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  // --- LOGIC DỮ LIỆU VÀ SỰ KIỆN ---
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertProps["severity"];
  } | null>(null);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset về trang đầu khi tìm kiếm
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);
  useEffect(() => {
    fetchLessons();
  }, [
    page,
    rowsPerPage,
    debouncedSearchTerm,
    filterLevel,
    filterType,
    refetchTrigger,
  ]);
  const fetchLessons = async () => {
    setLoading(true);
    setError("");
    try {
      const params: GetLessonsParams = {
        page: page + 1, // 👈 API của chúng ta là 1-indexed
        limit: rowsPerPage,
        searchTerm: debouncedSearchTerm,
        level: filterLevel,
        type: filterType,
      };
      const res = await getLessons(params);
      setLessons(res.data.data || []);
      setTotalItems(res.data.pagination.totalItems || 0);
    } catch (err) {
      console.error("❌ Failed to fetch lessons:", err);
      setError("Không thể tải danh sách bài học.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveSuccess = () => {
    setOpenWizard(false);
    setOpenVocabModal(false);
    setOpenReadingModal(false);
    setOpenGrammarModal(false);
    setOpenListeningModal(false);
    setRefetchTrigger((prev) => prev + 1);
    setSnackbar({
      open: true,
      message: "Đã lưu bài học thành công!",
      severity: "success",
    });
  };

  // 4. Cập nhật các hàm mở modal Sửa
  const handleOpenEditModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    switch (lesson.type) {
      case "vocab":
        setOpenVocabModal(true);
        break;
      case "reading":
        setOpenReadingModal(true);
        break;
      case "grammar":
        setOpenGrammarModal(true);
        break;
      case "listen":
        setOpenListeningModal(true);
        break;
      default:
        // Mở wizard cho các loại bài học khác (nếu cần)
        setOpenWizard(true);
        break;
    }
  };

  // 5. Cập nhật các hàm Xóa
  const handleDeleteClick = (id: string) => {
    setLessonToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (lessonToDelete) {
      try {
        await deleteLesson(lessonToDelete);
        setRefetchTrigger((prev) => prev + 1); // 👈 Trigger để useEffect chạy lại
        setSnackbar({
          open: true,
          message: "Đã xóa bài học.",
          severity: "success",
        });
      } catch (err) {
        console.error("Failed to delete:", err);
        alert("Không thể xóa bài học.");
      }
    }
    setDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  // 6. Cập nhật logic Lọc và Phân trang
  // const filteredLessons = lessons.filter((l) => {
  //   return (
  //     (l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       l.topic.toLowerCase().includes(searchTerm.toLowerCase())) &&
  //     (filterLevel === "all" || l.level === filterLevel) &&
  //     (filterType === "all" || l.type === filterType)
  //   );
  // });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 7. Hàm trợ giúp cho màu sắc (Giữ nguyên từ code cũ của bạn)
  //   // 7. Hàm trợ giúp cho màu sắc (Đã sửa)
  const getLevelColor = (level: string): ChipProps["color"] => {
    switch (level) {
      case "Beginner":
        return "success";
      case "Intermediate":
        return "primary";
      case "Advanced":
        return "warning";
      default:
        return "default";
    }
  };
  const getTypeColor = (type: string): ChipProps["color"] => {
    const colors: { [key: string]: ChipProps["color"] } = {
      vocab: "success",
      reading: "primary",
      grammar: "secondary",
      listen: "warning",
    };
    return colors[type] || "default";
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#088395"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SchoolIcon fontSize="large" /> Quản lý Bài học
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setOpenImportModal(true)}
            sx={{
              borderColor: "#088395",
              color: "#088395",
              "&:hover": { borderColor: "#0a9ca2", bgcolor: "#f0f9fa" },
            }}
          >
            Import Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: "#088395", "&:hover": { bgcolor: "#0a9ca2" } }}
            onClick={() => {
              setSelectedLesson(null);
              setOpenWizard(true);
            }}
          >
            Bài học mới
          </Button>
        </Box>
      </Box>

      {/* Filters & Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc chủ đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />
          <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Cấp độ</InputLabel>
            <Select
              value={filterLevel}
              label="Cấp độ"
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setPage(0);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Tất cả cấp độ</MenuItem>
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Loại bài học</InputLabel>
            <Select
              value={filterType}
              label="Loại bài học"
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tất cả loại</MenuItem>
              <MenuItem value="vocab">Từ vựng</MenuItem>
              <MenuItem value="reading">Bài đọc</MenuItem>
              <MenuItem value="grammar">Ngữ pháp</MenuItem>
              <MenuItem value="listen">Nghe</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* 8. THAY THẾ GRID BẰNG TABLE */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Tên Bài học</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Chủ đề</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Cấp độ</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Loại</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {lesson.name}
                      </Typography>
                      {/* <Typography variant="body2" color="text.secondary">{lesson.description}</Typography> */}
                    </TableCell>
                    <TableCell>
                      <Chip label={lesson.topic} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lesson.level}
                        color={getLevelColor(lesson.level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lesson.type}
                        color={getTypeColor(lesson.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Sửa">
                        <IconButton onClick={() => handleOpenEditModal(lesson)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(lesson._id!)}
                        >
                          <DeleteIcon fontSize="small" />
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
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Modals giữ nguyên */}
      <LessonWizardModal
        open={openWizard}
        onClose={() => setOpenWizard(false)}
        selectedLesson={selectedLesson as any} // Cast as any để khớp với form
        onSaveSuccess={handleSaveSuccess}
      />
      <VocabLessonModal
        open={openVocabModal}
        onClose={() => setOpenVocabModal(false)}
        selectedLesson={selectedLesson as any}
        onSaveSuccess={handleSaveSuccess}
      />
      <EditReadingModal
        open={openReadingModal}
        onClose={() => setOpenReadingModal(false)}
        lesson={selectedLesson as any}
        onSaveSuccess={handleSaveSuccess}
      />
      <EditGrammarModal
        open={openGrammarModal}
        onClose={() => setOpenGrammarModal(false)}
        selectedLesson={selectedLesson as any}
        onSaveSuccess={handleSaveSuccess}
      />
      <EditListeningModal
        open={openListeningModal}
        onClose={() => setOpenListeningModal(false)}
        selectedLesson={selectedLesson as any}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Import Modal */}
      <LessonImportModal
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onImportSuccess={(message) => {
          setSnackbar({ open: true, message, severity: "success" });
          setRefetchTrigger((prev) => prev + 1);
        }}
        onImportError={(message) => {
          setSnackbar({ open: true, message, severity: "error" });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc muốn xóa bài học này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar?.open || false}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar?.severity || "info"}
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
