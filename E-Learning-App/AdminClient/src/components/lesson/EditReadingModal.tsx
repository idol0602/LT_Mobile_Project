import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { QuillEditor } from "../ui/QuillEditor";
import { updateLesson } from "../../services/lessonApi";
import { QuestionItem } from "../ui/QuestionItem";
import type { Question } from "../../types/Question";

interface ReadingData {
  name: string;
  level: string;
  topic: string;
  readingContent: string;
  questions: Question[];
}

interface Lesson {
  _id: string;
  name: string;
  level: string;
  topic: string;
  type: "reading";
  readingContent?: string;
  questions?: Question[];
}

interface EditReadingModalProps {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onSaveSuccess: () => void;
}

export function EditReadingModal({
  open,
  onClose,
  lesson,
  onSaveSuccess,
}: EditReadingModalProps) {
  const [editingData, setEditingData] = useState<ReadingData>({
    name: "",
    level: "Beginner",
    topic: "",
    readingContent: "",
    questions: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // Cấu hình toolbar QuillJS
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "list",
    "bullet",
    "link",
    "image",
  ];

  const { quill, quillRef } = useQuill({ theme: "snow", modules, formats });

  // Load dữ liệu từ lesson khi mở modal
  useEffect(() => {
    if (!lesson) return;
    const loadedData: ReadingData = {
      name: lesson.name || "",
      level: lesson.level || "Beginner",
      topic: lesson.topic || "",
      readingContent: lesson.readingContent || "",
      questions:
        lesson.questions?.map((q) => ({
          questionText: q.questionText || "",
          options: q.options || ["", "", "", ""],
          correctAnswerIndex:
            typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
          answerText: q.answerText || "",
        })) || [],
    };
    setEditingData(loadedData);

    if (quill) {
      quill.setContents([]); // reset
      quill.clipboard.dangerouslyPasteHTML(loadedData.readingContent || "");
    }
  }, [lesson, quill, open]);
  useEffect(() => {
    if (!open) {
      setEditingData({
        name: "",
        level: "Beginner",
        topic: "",
        readingContent: "",
        questions: [],
      });
    }
  }, [open]);

  // Khi Quill khởi tạo, gán nội dung và lắng nghe thay đổi
  useEffect(() => {
    if (quill) {
      const handleChange = () => {
        const html = quill.root.innerHTML;
        setEditingData((prev) => ({ ...prev, readingContent: html }));
      };

      quill.on("text-change", handleChange);
      return () => {
        quill.off("text-change", handleChange);
      };
    }
  }, [quill]);

  const handleDataChange = (field: keyof ReadingData, value: any) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      answerText: "",
    };
    handleDataChange("questions", [...editingData.questions, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...editingData.questions];
    newQuestions.splice(index, 1);
    handleDataChange("questions", newQuestions);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const newQuestions = [...editingData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    handleDataChange("questions", newQuestions);
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    value: string
  ) => {
    const newQuestions = [...editingData.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex].options = newOptions;
    handleDataChange("questions", newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex: number, value: number) => {
    const newQuestions = [...editingData.questions];
    newQuestions[qIndex].correctAnswerIndex = value;
    handleDataChange("questions", newQuestions);
  };

  const handleSave = async () => {
    if (!lesson) return;
    setIsSaving(true);
    try {
      await updateLesson(lesson._id, {
        name: editingData.name,
        level: editingData.level as "Beginner" | "Intermediate" | "Advanced",
        topic: editingData.topic,
        readingContent: editingData.readingContent,
        questions: editingData.questions,
      });
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Failed to update reading lesson:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
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
        Chỉnh sửa Bài đọc
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* THÔNG TIN CHUNG */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Tên bài học"
            fullWidth
            value={editingData.name}
            onChange={(e) => handleDataChange("name", e.target.value)}
          />
          <TextField
            label="Cấp độ"
            select
            fullWidth
            value={editingData.level}
            onChange={(e) => handleDataChange("level", e.target.value)}
          >
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </TextField>
          <TextField
            label="Chủ đề"
            fullWidth
            value={editingData.topic}
            onChange={(e) => handleDataChange("topic", e.target.value)}
          />
        </Box>

        {/* BỐ CỤC 2 CỘT */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 4,
          }}
        >
          {/* CỘT TRÁI: BÀI ĐỌC */}
          <Box sx={{ flex: 1.2 }}>
            <Typography variant="h6" gutterBottom>
              Nội dung Bài đọc
            </Typography>
            <Paper
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                minHeight: 400,
                maxHeight: 500,
                overflowY: "auto",
              }}
            >
              <QuillEditor
                value={editingData.readingContent}
                onChange={(html) => handleDataChange("readingContent", html)}
              />
            </Paper>
          </Box>

          {/* CỘT PHẢI: CÂU HỎI */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Câu hỏi</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
              >
                Thêm
              </Button>
            </Box>

            <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
              {editingData.questions.map((question, qIndex) => (
                <QuestionItem
                  key={qIndex}
                  index={qIndex}
                  question={question}
                  onChange={handleQuestionChange}
                  onOptionChange={handleOptionChange}
                  onSelectCorrect={handleCorrectAnswerChange}
                  onDelete={handleRemoveQuestion}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
