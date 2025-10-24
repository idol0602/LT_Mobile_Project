// src/components/LessonSteps/Step2_Reading.tsx
import React from "react";
import { Box, TextField, Typography } from "@mui/material";

interface ReadingData {
  readingContent?: string;
  questions?: any[]; // Define a proper Question type later
}

interface Step2ReadingProps {
  readingData: ReadingData;
  onDataChange: (field: keyof ReadingData, value: any) => void;
}

export function Step2_Reading({
  readingData,
  onDataChange,
}: Step2ReadingProps) {
  return (
    <Box sx={{ pt: 1 }}>
      <Typography variant="h6" gutterBottom>
        Reading Content
      </Typography>
      <TextField
        name="readingContent"
        label="Enter the reading text here..."
        value={readingData.readingContent || ""}
        onChange={(e) => onDataChange("readingContent", e.target.value)}
        fullWidth
        multiline
        rows={10}
        sx={{ mb: 3 }}
      />
      <Typography variant="h6">Questions</Typography>
      {/* Add logic here later to add/edit questions */}
      <Typography variant="body2" color="text.secondary">
        Question management UI will be here.
      </Typography>
    </Box>
  );
}
