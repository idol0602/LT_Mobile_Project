import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Fade,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  TextField,
  // ChipProps,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { LessonWizardModal } from "../components/lesson/lessonWizardModal/LessonWizardModal";
import { getLessons, deleteLesson } from "../services/lessonApi"; // ✅ Import API
import { VocabLessonModal } from "../components/lesson/EditVocabModal";
import { EditReadingModal } from "../components/lesson/EditReadingModal";
import {
  BookIcon,
  DeleteIcon,
  EditIcon,
  FilterIcon,
  SearchIcon,
} from "lucide-react";
import { LessonCard } from "../components/lesson/LessonCard";
interface Lesson {
  _id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "";
  topic: string;
  type: "vocab" | "listen" | "grammar" | "reading" | "";
  vocabularies?: string[];
  readingContent?: string;
  questions?: any[];
}

export default function LessonPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openWizard, setOpenWizard] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openVocabModal, setOpenVocabModal] = useState(false);

  // Thêm states cho filters
  const [filterLevel, setFilterLevel] = useState("");
  const [filterType, setFilterType] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);

  const [selectedVocabLesson, setSelectedVocabLesson] = useState<Lesson | null>(
    null
  );
  const [openReadingModal, setOpenReadingModal] = useState(false);
  const [selectedReadingLesson, setSelectedReadingLesson] =
    useState<Lesson | null>(null);
  // 🔹 Fetch dữ liệu từ DB
  const fetchLessons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getLessons();
      const data = res.data?.data || [];
      setLessons(data);
    } catch (err) {
      console.error("❌ Failed to fetch lessons:", err);
      setError("Không thể tải danh sách bài học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // 🔹 Mở modal thêm/sửa
  const handleOpenWizard = (lesson?: Lesson) => {
    setSelectedLesson(lesson || null);
    setOpenWizard(true);
  };
  const handleOpenEditModal = (lesson: Lesson) => {
    switch (lesson.type) {
      case "vocab":
        handleOpenVocabModal(lesson);
        break;
      case "reading":
        handleOpenReadingModal(lesson);
        break;
      default:
        handleOpenWizard(lesson);
        break;
    }
  };
  const handleDeleteConfirm = async () => {
    if (lessonToDelete) {
      try {
        await deleteLesson(lessonToDelete);
        await fetchLessons();
      } catch (err) {
        console.error("Failed to delete:", err);
        alert("Không thể xóa bài học.");
      }
    }
    setDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  // Filtered lessons với filters mới
  const filteredLessons = lessons.filter((l) => {
    const nameMatch = l.name.toLowerCase().includes(searchTerm.toLowerCase());
    const levelMatch = !filterLevel || l.level === filterLevel;
    const typeMatch = !filterType || l.type === filterType;
    return nameMatch && levelMatch && typeMatch;
  });

  // Colors cho chips
  const getLevelColor = (level: string) => {
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

  //
  const getTypeColor = (type: string) => {
    // ✅ SỬA Ở ĐÂY: Thêm 'warning' và 'default' vào kiểu
    const colors: {
      [key: string]:
        | "primary"
        | "secondary"
        | "error"
        | "success"
        | "warning"
        | "default";
    } = {
      vocab: "success",
      reading: "primary",
      grammar: "secondary",
      listen: "warning", // Dòng này bây giờ đã hợp lệ
    };

    // Ép kiểu (cast) ở đây là an toàn nhất để đảm bảo hàm luôn trả về đúng kiểu
    return (colors[type] || "default") as
      | "primary"
      | "secondary"
      | "error"
      | "success"
      | "warning"
      | "default";
  };
  const handleCloseWizard = () => setOpenWizard(false);

  const handleOpenVocabModal = (lesson?: Lesson) => {
    setSelectedVocabLesson(lesson || null);
    setOpenVocabModal(true);
  };
  const handleOpenReadingModal = (lesson?: Lesson) => {
    setSelectedReadingLesson(lesson || null);
    setOpenReadingModal(true);
  };

  const handleCloseVocabModal = () => setOpenVocabModal(false);
  const handleCloseReadingModal = () => setOpenReadingModal(false);
  // 🔹 Khi thêm/sửa thành công, reload danh sách
  const handleSaveSuccess = async () => {
    await fetchLessons();
    console.log("Lesson saved successfully!");
  };

  // 🔹 Xóa bài học
  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await deleteLesson(id);
      await fetchLessons();
    } catch (err) {
      console.error("❌ Failed to delete lesson:", err);
      alert("Không thể xóa bài học.");
    }
  };
  return (
    <Box sx={{ p: 3, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="#088395">
          <BookIcon size={28} /> Lesson Management
        </Typography>
      </Box>

      {/* Filters & Search */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid sx={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search lessons by name..."
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
          </Grid>
          <Grid sx={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small">
              <Select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon size={16} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid sx={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="vocab">Vocab</MenuItem>
                <MenuItem value="reading">Reading</MenuItem>
                {/* Thêm các type khác */}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ bgcolor: "#088395", "&:hover": { bgcolor: "#0a9ca2" }, mb: 3 }}
        onClick={() => handleOpenWizard()}
      >
        New Lesson
      </Button>

      {/* Lessons Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredLessons.length === 0 ? (
        <Alert severity="info" icon={<BookIcon />}>
          No lessons found. Create your first lesson!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredLessons.map((lesson, index) => (
            <Grid key={lesson._id}>
              <LessonCard
                lesson={lesson as any}
                index={index}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteLesson}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modals giữ nguyên */}
      <LessonWizardModal
        open={openWizard}
        onClose={handleCloseWizard}
        selectedLesson={selectedLesson}
        onSaveSuccess={handleSaveSuccess}
      />
      <VocabLessonModal
        open={openVocabModal}
        onClose={handleCloseVocabModal}
        selectedLesson={selectedVocabLesson as any}
        onSaveSuccess={handleSaveSuccess}
      />
      <EditReadingModal
        open={openReadingModal}
        onClose={handleCloseReadingModal}
        lesson={selectedReadingLesson as any}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this lesson? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
