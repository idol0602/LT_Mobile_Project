import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import { palette } from "../../../styles/palette";
import { QuestionItem } from "../../ui/QuestionItem";
import type { Question } from "../../../types/Question";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "../../../styles/quill-custom.css";

interface Step2GrammarProps {
  questions: Question[];
  grammarContent?: string;
  onChange: (questions: Question[]) => void;
  onContentChange?: (content: string) => void;
}

export const Step2_Grammar: React.FC<Step2GrammarProps> = ({
  questions,
  grammarContent = "",
  onChange,
  onContentChange,
}) => {
  const quillRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<Quill | null>(null);

  // ====== KHỞI TẠO QUILL ======
  useEffect(() => {
    if (quillRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: "Enter grammar lesson content...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [{ align: [] }],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            ["clean"],
          ],
        },
      });

      // Set giá trị ban đầu
      quillInstance.current.root.innerHTML = grammarContent;

      // Lắng nghe thay đổi
      quillInstance.current.on("text-change", () => {
        const html = quillInstance.current!.root.innerHTML;
        console.log("✏️ Grammar content changed:", html);
        if (onContentChange) {
          onContentChange(html);
        }
      });
    }
  }, []);

  // Cập nhật content chỉ khi modal mới mở (grammarContent thay đổi lần đầu)
  useEffect(() => {
    if (quillInstance.current && grammarContent) {
      const currentContent = quillInstance.current.root.innerHTML;
      // Chỉ update nếu content từ bên ngoài khác với content hiện tại
      // và khác với nội dung trống/mặc định
      if (currentContent === "<p><br></p>" || currentContent === "") {
        quillInstance.current.root.innerHTML = grammarContent;
      }
    }
  }, [grammarContent]);
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    };
    onChange([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const updatedList = [...questions];
    (updatedList[index] as any)[field] = value;
    onChange(updatedList);
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    value: string
  ) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    onChange(updated);
  };

  const handleSelectCorrect = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswerIndex = optIndex;
    onChange(updated);
  };

  return (
    <Box>
      {/* Grammar Content Editor */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          color={palette.primary}
          sx={{ mb: 2 }}
        >
          📝 Grammar Content
        </Typography>
        <Typography
          variant="body2"
          color={palette.textSecondary}
          sx={{ mb: 2 }}
        >
          Use the professional editor below with advanced formatting options:
          <br />• <strong>Text Formatting:</strong> Bold, Italic, Underline,
          Strikethrough
          <br />• <strong>Colors:</strong> Text color & Background color
          <br />• <strong>Typography:</strong> Headers (H1-H6), Font family,
          Font size
          <br />• <strong>Lists & Alignment:</strong> Ordered/Unordered lists,
          Text alignment, Indentation
          <br />• <strong>Special Elements:</strong> Blockquotes, Code blocks,
          Links, Images, Videos
        </Typography>
        <Box
          ref={quillRef}
          sx={{
            "& .ql-container": {
              minHeight: "200px",
              fontSize: "14px",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
            },
            "& .ql-toolbar": {
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            },
            "& .ql-editor": {
              minHeight: "200px",
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Questions Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          color={palette.primary}
        >
          🧠 Grammar Questions
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Plus />}
          onClick={handleAddQuestion}
          sx={{
            color: palette.primary,
            borderColor: palette.primary,
            "&:hover": { bgcolor: palette.hoverBg },
          }}
        >
          Add Question
        </Button>
      </Box>

      {questions.length === 0 && (
        <Typography variant="body2" color={palette.textSecondary}>
          No questions added yet.
        </Typography>
      )}

      {questions.map((q, qIndex) => (
        <QuestionItem
          key={qIndex}
          index={qIndex}
          question={q}
          onChange={handleQuestionChange}
          onOptionChange={handleOptionChange}
          onSelectCorrect={handleSelectCorrect}
          onDelete={handleDeleteQuestion}
        />
      ))}

      {questions.length > 0 && <Divider sx={{ mt: 3 }} />}
    </Box>
  );
};
