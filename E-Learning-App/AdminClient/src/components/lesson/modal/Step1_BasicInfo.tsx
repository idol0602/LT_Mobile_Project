// src/components/LessonSteps/Step1_BasicInfo.tsx
import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

// Define expected data structure (can be imported from types later)
interface LessonData {
  name: string;
  level: string; // Use string for TextField, convert later
  topic: string;
  type: "vocab" | "listen" | "grammar" | "reading" | ""; // Allow empty initial state
}
export interface LessonErrors {
  name?: string;
  level?: string;
  topic?: string;
  type?: string;
}

interface Step1Props {
  lessonData: LessonData;
  onDataChange: (field: keyof LessonData, value: string | number) => void;
  errors: Partial<LessonErrors>; // To display validation errors
}

export function Step1_BasicInfo({
  lessonData,
  onDataChange,
  errors,
}: Step1Props) {
  const handleSelectChange = (event: SelectChangeEvent) => {
    onDataChange(event.target.name as keyof LessonData, event.target.value);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(event.target.name as keyof LessonData, event.target.value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
      <TextField
        name="name"
        label="Lesson Name *"
        value={lessonData.name}
        onChange={handleTextChange}
        fullWidth
        required
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        select
        label="Level *"
        fullWidth
        value={lessonData.level}
        onChange={(e) => onDataChange("level", e.target.value)}
        error={!!errors.level}
        helperText={errors.level}
      >
        <MenuItem value="Beginner">Beginner</MenuItem>
        <MenuItem value="Intermediate">Intermediate</MenuItem>
        <MenuItem value="Advanced">Advanced</MenuItem>
      </TextField>
      <TextField
        name="topic"
        label="Topic *"
        value={lessonData.topic}
        onChange={handleTextChange}
        fullWidth
        required
        error={!!errors.topic}
        helperText={errors.topic}
      />
      <FormControl fullWidth required error={!!errors.type}>
        <InputLabel>Lesson Type *</InputLabel>
        <Select
          name="type"
          value={lessonData.type}
          label="Lesson Type *"
          onChange={handleSelectChange}
        >
          <MenuItem value="vocab">Vocabulary</MenuItem>
          <MenuItem value="reading">Reading</MenuItem>
          <MenuItem value="grammar">Grammar</MenuItem>
          <MenuItem value="listen">Listening</MenuItem>
        </Select>
        {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
      </FormControl>
    </Box>
  );
}
