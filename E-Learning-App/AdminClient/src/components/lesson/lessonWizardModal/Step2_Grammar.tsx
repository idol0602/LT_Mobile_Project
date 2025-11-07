import React, { useState } from "react";
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

interface Step2GrammarProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}
interface Step2GrammarProps {
  questions: Question[];
  onChange: (updated: Question[]) => void;
}

export const Step2_Grammar: React.FC<Step2GrammarProps> = ({
  questions,
  onChange,
}) => {
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
