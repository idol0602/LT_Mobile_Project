import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  CircularProgress,
  IconButton,
  Divider,
  Alert,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Headphones } from "lucide-react";
import { updateLesson } from "../../services/lessonApi";
import type { Lesson as LessonData } from "../../types/Lesson";
import type { ListeningQuestion } from "../../types/ListeningQuestion";
import { Step2_Listening } from "./lessonWizardModal/Step2_Listenning";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";

// --- Props cho Modal ---
interface EditListeningModalProps {
  open: boolean;
  onClose: () => void;
  selectedLesson: LessonData | null;
  onSaveSuccess: () => void;
}

// --- Kiểu dữ liệu cho state nội bộ ---
interface ListeningLessonData {
  _id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "";
  topic: string;
  type: "listen";
  questions: ListeningQuestion[];
}

// --- State khởi tạo ---
const initialState: ListeningLessonData = {
  name: "",
  level: "Beginner",
  topic: "",
  type: "listen",
  questions: [],
};

export const EditListeningModal: React.FC<EditListeningModalProps> = ({
  open,
  onClose,
  selectedLesson,
  onSaveSuccess,
}) => {
  const [lessonData, setLessonData] =
    useState<ListeningLessonData>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Load dữ liệu bài học khi modal mở
  useEffect(() => {
    if (selectedLesson && open) {
      // Convert questions từ DB format sang UI format
      const questions = (selectedLesson.questions || []).map(
        (q: any, index: number) => ({
          id: q._id || `question-${index}`,
          audioFile: null,
          // Nếu có audioFileId, tạo URL để load từ server
          audioUrl: q.audioFileId
            ? `${API_BASE}/api/audio/${q.audioFileId}`
            : "",
          answerText: q.answerText || "",
        })
      );

      setLessonData({
        _id: selectedLesson._id,
        name: selectedLesson.name,
        level: selectedLesson.level || "Beginner",
        topic: selectedLesson.topic,
        type: "listen",
        questions: questions,
      });
      setError(""); // Xóa lỗi cũ
    } else if (!open) {
      setLessonData(initialState); // Reset state khi đóng
    }
  }, [selectedLesson, open]);

  // 2. Xử lý lưu thay đổi
  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      if (!lessonData._id) {
        throw new Error("Lesson ID is missing. Cannot update.");
      }

      // Validation
      if (!lessonData.name.trim()) {
        throw new Error("Tên bài học không được để trống.");
      }

      if (lessonData.questions.length === 0) {
        throw new Error("Cần có ít nhất 1 câu hỏi listening.");
      }

      // Kiểm tra các câu hỏi có đủ thông tin không
      const invalidQuestions = lessonData.questions.filter(
        (q) => !q.answerText.trim() || (!q.audioFile && !q.audioUrl)
      );

      if (invalidQuestions.length > 0) {
        throw new Error(
          "Tất cả câu hỏi phải có file audio và câu trả lời đúng."
        );
      }

      // Chuẩn bị FormData để gửi lên server
      const formData = new FormData();
      formData.append("name", lessonData.name);
      formData.append("level", lessonData.level);
      formData.append("topic", lessonData.topic);
      formData.append("type", lessonData.type);

      // Chuẩn bị questions data (không bao gồm File objects)
      const questionsData = lessonData.questions.map((q) => {
        // Nếu có audioFile mới, sẽ upload. Nếu không, giữ audioFileId cũ
        const questionData: any = {
          answerText: q.answerText,
        };

        // Nếu audioUrl có dạng http://localhost:5050/api/audio/:id
        // thì extract audioFileId từ URL
        if (q.audioUrl && q.audioUrl.includes("/api/audio/")) {
          const audioFileId = q.audioUrl.split("/api/audio/")[1];
          questionData.audioFileId = audioFileId;
        }

        return questionData;
      });

      formData.append("questions", JSON.stringify(questionsData));

      // Append audio files (chỉ những file mới)
      lessonData.questions.forEach((q) => {
        if (q.audioFile) {
          formData.append("audios", q.audioFile);
        }
      });

      // Gọi API với FormData
      const response = await fetch(
        `${API_BASE}/api/lessons/${lessonData._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update lesson");
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      console.error("❌ Failed to save listening lesson:", err);
      setError(
        err.message ||
          err.response?.data?.error ||
          "Không thể lưu bài học. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Handler cho các trường thông tin cơ bản
  const handleChange = (field: keyof ListeningLessonData, value: string) => {
    setLessonData((prev) => ({ ...prev, [field]: value }));
  };

  // 4. Handler để nhận dữ liệu từ Step2_Listening
  const handleQuestionsChange = (updatedQuestions: ListeningQuestion[]) => {
    setLessonData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#F8FAFC",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Headphones size={24} color="#088395" />
          <Typography variant="h6" fontWeight="bold" color="#088395">
            Edit Listening Lesson
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* --- Phần 1: Thông tin cơ bản --- */}
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          sx={{ mb: 2, color: "#088395" }}
        >
          📝 Lesson Details
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            label="Lesson Name *"
            fullWidth
            required
            value={lessonData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!lessonData.name.trim()}
            helperText={!lessonData.name.trim() ? "Required" : ""}
          />
          <TextField
            label="Topic"
            fullWidth
            value={lessonData.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
          />
          <TextField
            select
            label="Level *"
            fullWidth
            required
            value={lessonData.level}
            onChange={(e) => handleChange("level", e.target.value)}
          >
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </TextField>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* --- Phần 2: UI Câu hỏi Listening --- */}
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          sx={{ mb: 2, color: "#088395" }}
        >
          🎧 Listening Questions
        </Typography>
        <Step2_Listening
          questions={lessonData.questions}
          onQuestionsChange={handleQuestionsChange}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !lessonData.name.trim()}
          sx={{ bgcolor: "#088395", "&:hover": { bgcolor: "#0a9ca2" } }}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
