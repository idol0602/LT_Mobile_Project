// src/components/LessonSteps/Step2_Reading.tsx
import React from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// 1. Import Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline"; // Import extension cho gạch chân
import { Toolbar } from "../../Toolbar"; // Đường dẫn có thể cần sửa
import { theme } from "../../../styles/theme";
import { palette } from "../../../styles/palette";

// 2. Định nghĩa kiểu dữ liệu cho câu hỏi (SỬA LẠI CHO TRỰC QUAN HƠN)
interface Question {
  questionText: string;
  options: [string, string, string, string]; // Mảng 4 chuỗi
  correctAnswerIndex: number; // Lưu VỊ TRÍ (0, 1, 2, 3) của đáp án đúng
}

interface ReadingData {
  readingContent?: string;
  questions?: Question[];
}

interface Step2ReadingProps {
  readingData: ReadingData;
  onDataChange: (field: keyof ReadingData, value: any) => void;
}

export function Step2_Reading({
  readingData,
  onDataChange,
}: Step2ReadingProps) {
  const content = readingData.readingContent || "";
  const questions = readingData.questions || [];

  // 3. Thiết lập Tiptap Editor (thêm Underline)
  const editor = useEditor({
    extensions: [
      StarterKit, // Kích hoạt các tính năng cơ bản
      Underline, // Thêm tính năng gạch chân
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onDataChange("readingContent", editor.getHTML());
    },
    editorProps: {
      attributes: { class: "tiptap-editor-content" },
    },
  });

  // --- HÀM XỬ LÝ CHO CÂU HỎI ---

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0, // Mặc định chọn đáp án đầu tiên
    };
    onDataChange("questions", [...questions, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    onDataChange("questions", newQuestions);
  };

  const handleQuestionTextChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    onDataChange("questions", newQuestions);
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options] as [
      string,
      string,
      string,
      string
    ];
    newOptions[optIndex] = value;
    newQuestions[qIndex].options = newOptions;
    onDataChange("questions", newQuestions);
  };

  // Sửa lại: Hàm này nhận index (0-3) của đáp án đúng
  const handleCorrectAnswerChange = (
    qIndex: number,
    newCorrectIndex: number
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswerIndex = newCorrectIndex;
    onDataChange("questions", newQuestions);
  };

  return (
    // 4. CHIA LAYOUT 2 CỘT (Không dùng Grid)
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" }, // 1 cột trên mobile, 2 cột trên desktop
        gap: 4,
        pt: 1,
      }}
    >
      {/* --- CỘT BÊN TRÁI: SOẠN THẢO VĂN BẢN --- */}
      <Box sx={{ flex: 1.2, minWidth: 0 }}>
        <Typography variant="h6" gutterBottom>
          Nội dung Bài đọc
        </Typography>
        <Paper
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
        >
          <Toolbar editor={editor} />
          <Box sx={{ p: 2, minHeight: 400, maxHeight: 500, overflowY: "auto" }}>
            <EditorContent editor={editor} />
          </Box>
        </Paper>
      </Box>

      {/* --- CỘT BÊN PHẢI: QUẢN LÝ CÂU HỎI --- */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
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

        {/* Danh sách câu hỏi có thể cuộn */}
        <Box sx={{ maxHeight: "500px", overflowY: "auto", p: 0.5 }}>
          {questions.map((q, qIndex) => (
            <Paper
              key={qIndex}
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: palette.surface,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography fontWeight="bold">Câu hỏi {qIndex + 1}</Typography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveQuestion(qIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <TextField
                label={`Nội dung câu hỏi ${qIndex + 1}`}
                value={q.questionText}
                onChange={(e) =>
                  handleQuestionTextChange(qIndex, e.target.value)
                }
                fullWidth
                margin="normal"
              />

              {/* 5. THIẾT KẾ LẠI GIAO DIỆN CÂU HỎI */}
              <FormControl fullWidth margin="normal">
                <FormLabel>Các lựa chọn trả lời (Chọn 1 đáp án đúng)</FormLabel>
                <RadioGroup
                  // Giá trị của RadioGroup là VỊ TRÍ của đáp án đúng
                  value={q.correctAnswerIndex}
                  onChange={(e) =>
                    handleCorrectAnswerChange(qIndex, parseInt(e.target.value))
                  }
                >
                  {q.options.map((opt, optIndex) => (
                    // Mỗi FormControlLabel có giá trị là index của nó
                    <FormControlLabel
                      key={optIndex}
                      value={optIndex} // Giá trị là 0, 1, 2, hoặc 3
                      control={<Radio />}
                      label={
                        <TextField
                          label={`Lựa chọn ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(qIndex, optIndex, e.target.value)
                          }
                          fullWidth
                          size="small"
                          variant="standard"
                          sx={{ ml: -1 }} // Căn chỉnh TextField
                        />
                      }
                      sx={{
                        width: "100%",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        pb: 1,
                        mb: 1,
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Paper>
          ))}
          {questions.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 4 }}
            >
              Nhấn "Thêm" để tạo câu hỏi đầu tiên.
            </Typography>
          )}
        </Box>
      </Box>

      {/* 6. Thêm CSS cho Tiptap (quan trọng) */}
      <style>{`
        .tiptap-editor-content:focus { outline: none; }
        .tiptap-editor-content p { margin: 0; }
        .tiptap-editor-content ul, .tiptap-editor-content ol { padding-left: 2em; }
        .tiptap-editor-content blockquote { border-left: 3px solid #ccc; margin-left: 1em; padding-left: 1em; }
      `}</style>
    </Box>
  );
}
