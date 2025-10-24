import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import { LessonWizardModal } from "../components/LessonWizardModal";
import { getLessons, deleteLesson } from "../services/api"; // ✅ Import API
import { VocabLessonModal } from "../components/lesson/modal/VocabLessonModal";
import { EditReadingModal } from "../components/lesson/modal/EditReadingModal";
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

  // 🔹 Lọc theo tên
  const filteredLessons = lessons.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3, color: "#088395" }}
      >
        📘 Lesson Management
      </Typography>

      {/* Thanh tìm kiếm và nút thêm */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 3,
          border: "1px solid #E0E7EF",
          background:
            "linear-gradient(135deg, rgba(8,131,149,0.05), rgba(0,184,169,0.08))",
        }}
      >
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <SearchIcon sx={{ mr: 1, color: "#64748B" }} />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "1rem",
            }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ bgcolor: "#088395", "&:hover": { bgcolor: "#0a9ca2" } }}
          onClick={() => handleOpenWizard()}
        >
          New Lesson
        </Button>
      </Paper>

      {/* Hiển thị loading hoặc lỗi */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredLessons.length === 0 ? (
        <Alert severity="info">Không có bài học nào.</Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {filteredLessons.map((lesson, index) => (
            <Fade in key={lesson._id} timeout={200 + index * 100}>
              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: 3,
                  p: 2,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  transition: "0.2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {lesson.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Level: {lesson.level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Topic: {lesson.topic}
                </Typography>
                <Chip
                  label={lesson.type.toUpperCase() || "N/A"}
                  size="small"
                  sx={{ mt: 1, bgcolor: "#E0F2F1", color: "#088395" }}
                />

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <Tooltip title="Edit">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditModal(lesson)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteLesson(lesson._id!)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Fade>
          ))}
        </Box>
      )}

      {/* ✅ Modal thêm/sửa bài học */}
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
        onSaveSuccess={fetchLessons}
      />
      <EditReadingModal
        open={openReadingModal}
        onClose={handleCloseReadingModal}
        lesson={selectedReadingLesson as any}
        onSaveSuccess={fetchLessons}
      />
    </Box>
  );
}
