import React from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Grid,
  Paper,
} from "@mui/material";
import { Trash2, CheckCircle } from "lucide-react";
import { palette } from "../../styles/palette";
import type { Question } from "../../types/Question";

interface QuestionItemProps {
  index: number;
  question: Question;
  onChange: (index: number, field: keyof Question, value: any) => void;
  onOptionChange: (qIndex: number, optIndex: number, value: string) => void;
  onSelectCorrect: (qIndex: number, optIndex: number) => void;
  onDelete: (index: number) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  index,
  question,
  onChange,
  onOptionChange,
  onSelectCorrect,
  onDelete,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        border: `1px solid ${palette.border}`,
        background: palette.surface,
        boxShadow: palette.shadowSm,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color={palette.textPrimary}
        >
          Question {index + 1}
        </Typography>
        <IconButton
          onClick={() => onDelete(index)}
          sx={{ color: palette.danger }}
        >
          <Trash2 size={18} />
        </IconButton>
      </Box>

      {/* Question text */}
      <TextField
        label="Question Text"
        value={question.questionText}
        fullWidth
        onChange={(e) => onChange(index, "questionText", e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Options */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          mt: 1.5,
        }}
      >
        {question.options.map((opt, optIndex) => (
          <Box key={optIndex}>
            <TextField
              label={`Option ${optIndex + 1}`}
              value={opt}
              fullWidth
              onChange={(e) => onOptionChange(index, optIndex, e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => onSelectCorrect(index, optIndex)}
                    sx={{
                      color:
                        question.correctAnswerIndex === optIndex
                          ? palette.success
                          : palette.textMuted,
                    }}
                  >
                    <CheckCircle
                      size={18}
                      fill={
                        question.correctAnswerIndex === optIndex
                          ? palette.success
                          : "transparent"
                      }
                    />
                  </IconButton>
                ),
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Optional explanation */}
      <TextField
        label="Answer Explanation (optional)"
        value={question.answerText || ""}
        fullWidth
        multiline
        rows={2}
        onChange={(e) => onChange(index, "answerText", e.target.value)}
        sx={{ mt: 2 }}
      />
    </Paper>
  );
};
