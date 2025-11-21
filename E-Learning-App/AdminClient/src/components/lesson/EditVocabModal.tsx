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
  Alert,
  IconButton,
  Typography,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { Step2_Vocab } from "./lessonWizardModal/Step2_Vocab";
import {
  addLesson,
  updateLesson,
  getVocabulariesByLessonId,
} from "../../services/lessonApi";
import { BookIcon } from "lucide-react";

interface VocabLessonModalProps {
  open: boolean;
  onClose: () => void;
  selectedLesson?: LessonData | null;
  onSaveSuccess: () => void;
}

export interface LessonData {
  _id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "";
  topic: string;
  type: "vocab";
  vocabularies: string[];
}

// 💡 Thêm interface (hoặc import) cho Vocabulary
// Giúp TypeScript hiểu kiểu dữ liệu trả về từ API
interface IVocabulary {
  _id: string; // ... các trường khác của từ vựng
}

export const VocabLessonModal: React.FC<VocabLessonModalProps> = ({
  open,
  onClose,
  selectedLesson,
  onSaveSuccess,
}) => {
  const [lessonData, setLessonData] = useState<LessonData>({
    name: "",
    level: "Beginner",
    topic: "",
    type: "vocab",
    vocabularies: [],
  });
  const [loading, setLoading] = useState(false); // Dùng khi 'Save'
  const [loadingVocabs, setLoadingVocabs] = useState(false); // 👈 Dùng khi fetch vocabs
  const [error, setError] = useState("");

  // 🔹 Consolidated useEffect: Load lesson data và fetch vocabularies
  useEffect(() => {
    // Helper function để fetch vocabularies
    const fetchVocabularies = async (lessonId: string) => {
      setLoadingVocabs(true);
      setError("");
      try {
        const response = await getVocabulariesByLessonId(lessonId);
        const fetchedVocabs: IVocabulary[] = response.data.data || [];
        const vocabIds = fetchedVocabs.map((v) => v._id);

        setLessonData((prev) => ({
          ...prev,
          vocabularies: vocabIds,
        }));
      } catch (err: any) {
        console.error("Failed to fetch vocabularies for lesson:", err);
        setError("Failed to load vocabularies for this lesson.");
      } finally {
        setLoadingVocabs(false);
      }
    };

    if (selectedLesson) {
      setLessonData((prev) => ({
        _id: selectedLesson._id,
        name: selectedLesson.name || "",
        level: selectedLesson.level || "Beginner",
        topic: selectedLesson.topic || "",
        type: "vocab",
        // Giữ vocabularies hiện tại, sẽ được update bởi fetchVocabularies
        vocabularies: prev.vocabularies || [],
      }));

      // Fetch vocabularies nếu đang edit (có _id) và modal đang open
      if (selectedLesson._id && open) {
        fetchVocabularies(selectedLesson._id);
      }
    } else {
      // tạo mới: reset đầy đủ
      setLessonData({
        name: "",
        level: "Beginner",
        topic: "",
        type: "vocab",
        vocabularies: [],
      });
    }

    // reset error & loading flag mỗi lần mở modal
    setError("");
    if (!selectedLesson?._id) {
      setLoadingVocabs(false);
    }
  }, [selectedLesson, open]); // Phụ thuộc vào 2 prop này

  // 🔹 Xử lý lưu bài học
  // nếu bạn muốn reset form khi đóng modal để lần mở tiếp là "sạch"
  const handleCloseAndReset = () => {
    // reset toàn bộ state về mặc định
    setLessonData({
      name: "",
      level: "Beginner",
      topic: "",
      type: "vocab",
      vocabularies: [],
    });
    setError("");
    setLoading(false);
    setLoadingVocabs(false);
    onClose();
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (lessonData._id) {
        response = await updateLesson(lessonData._id, lessonData);
      } else {
        response = await addLesson(lessonData);
      }

      console.log("✅ Saved lesson:", response.data);
      onSaveSuccess();
      handleCloseAndReset();
    } catch (err: any) {
      console.error("❌ Failed to save vocab lesson:", err);
      setError(
        err.response?.data?.error ||
          "Không thể lưu bài học. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  }; // 🔹 Xử lý thay đổi dữ liệu

  const handleChange = (field: keyof LessonData, value: any) => {
    setLessonData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={handleCloseAndReset} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "#F8FAFC", borderBottom: 1, borderColor: "divider" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#088395">
            {lessonData._id ? "Edit" : "Create"} Vocabulary Lesson
          </Typography>
          <IconButton onClick={handleCloseAndReset}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {/* Basic Info Section */}
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          sx={{ mb: 2, color: "#088395" }}
        >
          <BookIcon size={18} /> Lesson Details
        </Typography>
        <Grid container spacing={2}>
          <Grid sx={{ xs: 12, md: 6 }}>
            <TextField
              label="Lesson Name *"
              fullWidth
              required
              value={lessonData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              helperText={!lessonData.name ? "Required" : ""}
              error={!lessonData.name}
            />
          </Grid>
          <Grid sx={{ xs: 12, md: 6 }}>
            <TextField
              label="Topic"
              fullWidth
              value={lessonData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
            />
          </Grid>
          <Grid sx={{ xs: 12, md: 6 }}>
            <TextField
              select
              label="Level *"
              fullWidth
              required
              value={lessonData.level}
              onChange={(e) => handleChange("level", e.target.value as any)}
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Vocab Section */}
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          sx={{ mt: 3, mb: 2, color: "#088395" }}
        >
          📚 Select Vocabularies
        </Typography>
        {loadingVocabs ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Step2_Vocab
            selectedVocabIds={lessonData.vocabularies || []}
            onVocabChange={(ids) => handleChange("vocabularies", ids)}
          />
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={handleCloseAndReset} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            loading ||
            loadingVocabs ||
            !lessonData.name ||
            !lessonData.level ||
            lessonData.vocabularies.length === 0
          }
          sx={{ bgcolor: "#088395", "&:hover": { bgcolor: "#0a9ca2" } }}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Save Lesson
        </Button>
      </DialogActions>
    </Dialog>
  );
};
