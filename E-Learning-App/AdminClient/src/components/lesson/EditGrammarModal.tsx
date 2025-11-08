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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { updateLesson } from "../../services/lessonApi";
import type { Lesson as LessonData } from "../../types/Lesson";
import type { Question } from "../../types/Question"; // 👈 Import kiểu Question
import { Step2_Grammar } from "./lessonWizardModal/Step2_Grammar"; // 👈 Import UI bạn đã cung cấp

// --- Props cho Modal ---
interface EditGrammarModalProps {
  open: boolean;
  onClose: () => void;
  selectedLesson: LessonData | null;
  onSaveSuccess: () => void;
}

// --- Kiểu dữ liệu cho state nội bộ ---
interface GrammarLessonData {
  _id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "";
  topic: string;
  type: "grammar";
  questions: Question[];
}

// --- State khởi tạo ---
const initialState: GrammarLessonData = {
  name: "",
  level: "Beginner",
  topic: "",
  type: "grammar",
  questions: [],
};

export const EditGrammarModal: React.FC<EditGrammarModalProps> = ({
  open,
  onClose,
  selectedLesson,
  onSaveSuccess,
}) => {
  const [lessonData, setLessonData] = useState<GrammarLessonData>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // 1. Load dữ liệu bài học khi modal mở

  useEffect(() => {
    if (selectedLesson && open) {
      setLessonData({
        _id: selectedLesson._id,
        name: selectedLesson.name,
        level: selectedLesson.level || "Beginner",
        topic: selectedLesson.topic,
        type: "grammar",
        questions: selectedLesson.questions || [],
      });
      setError(""); // Xóa lỗi cũ
    } else if (!open) {
      setLessonData(initialState); // Reset state khi đóng
    }
  }, [selectedLesson, open]); // 2. Xử lý lưu thay đổi

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      if (!lessonData._id) {
        throw new Error("Lesson ID is missing. Cannot update.");
      }
      await updateLesson(lessonData._id, lessonData);
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      console.error("❌ Failed to save grammar lesson:", err);
      setError(
        err.response?.data?.error ||
          "Không thể lưu bài học. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  }; // 3. Handler cho các trường thông tin cơ bản

  const handleChange = (field: keyof GrammarLessonData, value: string) => {
    setLessonData((prev) => ({ ...prev, [field]: value }));
  }; // 4. Handler để nhận dữ liệu từ Step2_Grammar

  const handleQuestionsChange = (updatedQuestions: Question[]) => {
    setLessonData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
           {" "}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
                Edit Grammar Lesson        {" "}
        <IconButton onClick={onClose}>
                    <CloseIcon />       {" "}
        </IconButton>
             {" "}
      </DialogTitle>
           {" "}
      <DialogContent dividers>
                {/* --- Phần 1: Thông tin cơ bản --- */}       {" "}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                   {" "}
          <TextField
            label="Lesson Name"
            fullWidth
            value={lessonData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
                   {" "}
          <TextField
            label="Topic"
            fullWidth
            value={lessonData.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
          />
                   {" "}
          <TextField
            select
            label="Level"
            fullWidth
            value={lessonData.level}
            onChange={(e) => handleChange("level", e.target.value)}
          >
                        <MenuItem value="Beginner">Beginner</MenuItem>         
              <MenuItem value="Intermediate">Intermediate</MenuItem>           {" "}
            <MenuItem value="Advanced">Advanced</MenuItem>         {" "}
          </TextField>
                 {" "}
        </Box>
                <Divider sx={{ mb: 3 }} />       {" "}
        {/* --- Phần 2: UI Câu hỏi Ngữ pháp --- */}
               {" "}
        <Step2_Grammar
          questions={lessonData.questions}
          onChange={handleQuestionsChange}
        />
               {" "}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
                        {error}         {" "}
          </Alert>
        )}
             {" "}
      </DialogContent>
           {" "}
      <DialogActions sx={{ p: 2 }}>
               {" "}
        <Button onClick={onClose} disabled={loading}>
                    Cancel        {" "}
        </Button>
               {" "}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !lessonData.name.trim()}
          sx={{ bgcolor: "#088395", "&:hover": { bgcolor: "#0a9ca2" } }}
        >
                    {loading ? <CircularProgress size={24} /> : "Save Changes"} 
               {" "}
        </Button>
             {" "}
      </DialogActions>
         {" "}
    </Dialog>
  );
};
