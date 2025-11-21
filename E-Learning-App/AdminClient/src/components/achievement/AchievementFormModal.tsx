import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  FormControlLabel,
  Switch,
  type SelectChangeEvent,
} from "@mui/material";
import { useState, useEffect } from "react";
import type { Achievement } from "../../services/achievementApi";

interface AchievementFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (achievement: Partial<Achievement>) => void;
  achievement?: Achievement | null;
  mode: "create" | "edit";
}

export const AchievementFormModal = ({
  open,
  onClose,
  onSave,
  achievement,
  mode,
}: AchievementFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Achievement>>({
    name: "",
    code: "",
    description: "",
    type: "global",
    condition: {},
    difficulty: "easy",
    icon: "🏆",
    hidden: false,
  });

  useEffect(() => {
    if (achievement && mode === "edit") {
      setFormData(achievement);
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        type: "global",
        condition: {},
        difficulty: "easy",
        icon: "🏆",
        hidden: false,
      });
    }
  }, [achievement, mode, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      hidden: e.target.checked,
    }));
  };

  const handleConditionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      condition: {
        ...prev.condition,
        [name]: value ? Number(value) : undefined,
      },
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      condition: {
        ...prev.condition,
        category: e.target.value || undefined,
      },
    }));
  };

  const handleSubmit = () => {
    // Validate
    if (!formData.name || !formData.code) {
      alert("Name and Code are required!");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Create New Achievement" : "Edit Achievement"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/* Basic Info */}
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            fullWidth
            required
            helperText="Unique identifier (e.g., FIRST_STEP)"
            disabled={mode === "edit"}
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />

          {/* Icon */}
          <TextField
            label="Icon (Emoji)"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            fullWidth
            helperText="Enter an emoji (e.g., 🏆, 🎯, 🔥)"
          />

          {/* Type & Difficulty */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type || "global"}
                onChange={handleSelectChange}
                label="Type"
              >
                <MenuItem value="first">First (First achievement)</MenuItem>
                <MenuItem value="progress">
                  Progress (Lessons completed)
                </MenuItem>
                <MenuItem value="vocab">Vocabulary (Words learned)</MenuItem>
                <MenuItem value="streak">Streak (Consecutive days)</MenuItem>
                <MenuItem value="global">Global (General)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                name="difficulty"
                value={formData.difficulty || "easy"}
                onChange={handleSelectChange}
                label="Difficulty"
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Conditions */}
          <Box
            sx={{
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 1,
              backgroundColor: "#f9f9f9",
            }}
          >
            <InputLabel sx={{ mb: 1, fontWeight: "bold" }}>
              Unlock Conditions
            </InputLabel>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Min Lessons Completed"
                name="minLessonsCompleted"
                type="number"
                value={formData.condition?.minLessonsCompleted || ""}
                onChange={handleConditionChange}
                fullWidth
                helperText="Minimum lessons to unlock"
              />

              <TextField
                label="Min Words Learned"
                name="minWordsLearned"
                type="number"
                value={formData.condition?.minWordsLearned || ""}
                onChange={handleConditionChange}
                fullWidth
                helperText="For vocabulary achievements"
              />

              <TextField
                label="Min Streak"
                name="minStreak"
                type="number"
                value={formData.condition?.minStreak || ""}
                onChange={handleConditionChange}
                fullWidth
                helperText="Consecutive days required"
              />

              <TextField
                label="Category (Optional)"
                name="category"
                value={formData.condition?.category || ""}
                onChange={handleCategoryChange}
                fullWidth
                helperText="reading, vocab, listening, grammar"
              />
            </Box>
          </Box>

          {/* Hidden Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.hidden || false}
                onChange={handleSwitchChange}
              />
            }
            label="Hidden (Only visible when unlocked)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
