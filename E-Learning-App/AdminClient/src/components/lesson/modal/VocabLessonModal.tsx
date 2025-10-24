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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { Step2_Vocab } from "./Step2_Vocab";
import { addLesson, updateLesson } from "../../../services/api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Khi mở modal, load dữ liệu cũ nếu có
  useEffect(() => {
    if (selectedLesson) {
      setLessonData({
        _id: selectedLesson._id,
        name: selectedLesson.name,
        level: selectedLesson.level,
        topic: selectedLesson.topic,
        type: "vocab",
        vocabularies: selectedLesson.vocabularies || [],
      });
    } else {
      setLessonData({
        name: "",
        level: "Beginner",
        topic: "",
        type: "vocab",
        vocabularies: [],
      });
    }
  }, [selectedLesson, open]);

  // 🔹 Xử lý lưu bài học
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
      onClose();
    } catch (err: any) {
      console.error("❌ Failed to save vocab lesson:", err);
      setError(
        err.response?.data?.error ||
          "Không thể lưu bài học. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Xử lý thay đổi dữ liệu
  const handleChange = (field: keyof LessonData, value: any) => {
    setLessonData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {lessonData._id ? "Edit Vocabulary Lesson" : "Create Vocabulary Lesson"}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Basic Info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <TextField
            label="Lesson Name"
            fullWidth
            value={lessonData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextField
            label="Topic"
            fullWidth
            value={lessonData.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
          />
          <TextField
            select
            label="Level"
            fullWidth
            value={lessonData.level}
            onChange={(e) => handleChange("level", e.target.value)}
          >
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </TextField>
        </Box>

        {/* Vocabulary Selection */}
        <Typography variant="subtitle1" sx={{ mb: 1, color: "#088395" }}>
          📘 Select vocabularies for this lesson
        </Typography>
        <Step2_Vocab
          selectedVocabIds={lessonData.vocabularies || []}
          onVocabChange={(ids) => handleChange("vocabularies", ids)}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !lessonData.name.trim()}
          sx={{ bgcolor: "#088395", "&:hover": { bgcolor: "#0a9ca2" } }}
        >
          {loading ? <CircularProgress size={24} /> : "Save Lesson"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
