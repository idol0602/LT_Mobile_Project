// src/components/LessonSteps/Step2_Reading.tsx
import React, { useEffect, useRef } from "react";
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
import Quill from "quill";
import "quill/dist/quill.snow.css"; // giao diện mặc định
import { QuestionItem } from "../../ui/QuestionItem";

// =================== ĐỊNH NGHĨA KIỂU DỮ LIỆU ===================
interface Question {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
}

interface ReadingData {
  readingContent?: string;
  questions?: Question[];
}

interface Step2ReadingProps {
  readingData: ReadingData;
  onDataChange: (field: keyof ReadingData, value: any) => void;
}

// =================== COMPONENT CHÍNH ===================
export function Step2_Reading({
  readingData,
  onDataChange,
}: Step2ReadingProps) {
  const content = readingData.readingContent || "";
  const questions = readingData.questions || [];

  const quillRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<Quill | null>(null);

  // ====== KHỞI TẠO QUILL ======
  useEffect(() => {
    if (quillRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: "Nhập nội dung bài đọc...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        },
      });

      // Set giá trị ban đầu (HTML)
      quillInstance.current.root.innerHTML = content;

      // Lắng nghe thay đổi nội dung
      quillInstance.current.on("text-change", () => {
        const html = quillInstance.current!.root.innerHTML;
        onDataChange("readingContent", html);
      });
    }

    // Nếu content thay đổi từ ngoài (ví dụ: khi load dữ liệu)
    if (
      quillInstance.current &&
      content !== quillInstance.current.root.innerHTML
    ) {
      quillInstance.current.root.innerHTML = content;
    }
  }, [content, onDataChange]);

  // ====== CÂU HỎI ======
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
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

  const handleCorrectAnswerChange = (
    qIndex: number,
    newCorrectIndex: number
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswerIndex = newCorrectIndex;
    onDataChange("questions", newQuestions);
  };

  // =================== GIAO DIỆN ===================
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: 4,
        pt: 1,
      }}
    >
      {/* --- CỘT TRÁI: BÀI ĐỌC --- */}
      <Box sx={{ flex: 1.2, minWidth: 0 }}>
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
          {/* Container cho Quill */}
          <div
            ref={quillRef}
            style={{ height: "320px" }}
            className="quill-editor"
          />
        </Paper>
      </Box>

      {/* --- CỘT PHẢI: CÂU HỎI --- */}
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

        <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
          {questions.map((question, qIndex) => (
            <QuestionItem
              key={qIndex}
              index={qIndex}
              question={question}
              onChange={handleQuestionTextChange}
              onOptionChange={handleOptionChange}
              onSelectCorrect={handleCorrectAnswerChange}
              onDelete={handleRemoveQuestion}
            />
          ))}
          {questions.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 3 }}
            >
              Nhấn "Thêm" để tạo câu hỏi đầu tiên.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
