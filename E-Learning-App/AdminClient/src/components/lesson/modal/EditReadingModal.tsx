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
import { updateLesson } from "../../../services/api";

interface Question {
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: string;
}

interface ReadingData {
  name?: string;
  level?: string;
  topic?: string;
  readingContent?: string;
  questions?: Question[];
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
    level: "",
    topic: "",
    readingContent: "",
    questions: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // Cấu hình toolbar cho QuillJS
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

  // Khởi tạo QuillJS
  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules,
    formats,
  });

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (lesson && open) {
      const data: ReadingData = {
        name: lesson.name,
        level: lesson.level,
        topic: lesson.topic,
        readingContent: lesson.readingContent || "",
        questions: lesson.questions || [],
      };
      setEditingData(data);
    }
  }, [lesson, open]);

  // Khi Quill khởi tạo, gán nội dung ban đầu và lắng nghe thay đổi
  useEffect(() => {
    if (quill) {
      quill.root.innerHTML = editingData.readingContent || "";
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        handleDataChange("readingContent", html);
      });
    }
  }, [quill, editingData.readingContent]);

  const handleDataChange = (field: keyof ReadingData, value: any) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    };
    handleDataChange("questions", [
      ...(editingData.questions || []),
      newQuestion,
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...(editingData.questions || [])];
    newQuestions.splice(index, 1);
    handleDataChange("questions", newQuestions);
  };

  const handleQuestionTextChange = (index: number, value: string) => {
    const newQuestions = [...(editingData.questions || [])];
    newQuestions[index].questionText = value;
    handleDataChange("questions", newQuestions);
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    value: string
  ) => {
    const newQuestions = [...(editingData.questions || [])];
    const newOptions = [...newQuestions[qIndex].options] as [
      string,
      string,
      string,
      string
    ];
    newOptions[optIndex] = value;
    newQuestions[qIndex].options = newOptions;
    handleDataChange("questions", newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex: number, value: string) => {
    const newQuestions = [...(editingData.questions || [])];
    newQuestions[qIndex].correctAnswer = value;
    handleDataChange("questions", newQuestions);
  };

  // Lưu dữ liệu
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
        {/* ====== THÔNG TIN CHUNG ====== */}
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

        {/* ====== BỐ CỤC 2 CỘT ====== */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 4,
          }}
        >
          {/* --- CỘT TRÁI: BÀI ĐỌC --- */}
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
              {/* QuillJS Editor */}
              <div ref={quillRef} style={{ height: "320px" }} />
            </Paper>
          </Box>

          {/* --- CỘT PHẢI: CÂU HỎI --- */}
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
              {(editingData.questions || []).map((q, qIndex) => (
                <Paper
                  key={qIndex}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography fontWeight="bold">
                      Câu hỏi {qIndex + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <TextField
                    label="Nội dung câu hỏi"
                    fullWidth
                    value={q.questionText}
                    onChange={(e) =>
                      handleQuestionTextChange(qIndex, e.target.value)
                    }
                    margin="normal"
                  />

                  <FormControl fullWidth>
                    <FormLabel>Lựa chọn đáp án</FormLabel>
                    <RadioGroup
                      value={q.correctAnswer}
                      onChange={(e) =>
                        handleCorrectAnswerChange(qIndex, e.target.value)
                      }
                    >
                      {q.options.map((opt, optIndex) => (
                        <FormControlLabel
                          key={optIndex}
                          value={opt}
                          control={<Radio />}
                          label={
                            <TextField
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(
                                  qIndex,
                                  optIndex,
                                  e.target.value
                                )
                              }
                              fullWidth
                              variant="standard"
                              placeholder={`Lựa chọn ${optIndex + 1}`}
                            />
                          }
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Paper>
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
