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
    conditions: [],
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
        conditions: [],
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

  const handleAddCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        { key: "", operator: ">=", value: "" },
      ],
    }));
  };

  const handleRemoveCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleConditionFieldChange = (
    index: number,
    field: "key" | "operator" | "value",
    value: string
  ) => {
    setFormData((prev) => {
      const newConditions = [...(prev.conditions || [])];
      newConditions[index] = {
        ...newConditions[index],
        [field]: value,
      };
      return { ...prev, conditions: newConditions };
    });
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <InputLabel sx={{ fontWeight: "bold" }}>
                Unlock Conditions
              </InputLabel>
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddCondition}
              >
                + Add Condition
              </Button>
            </Box>

            {formData.conditions && formData.conditions.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {formData.conditions.map((condition, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      p: 1,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      backgroundColor: "white",
                    }}
                  >
                    <TextField
                      label="Key"
                      value={condition.key}
                      onChange={(e) =>
                        handleConditionFieldChange(index, "key", e.target.value)
                      }
                      size="small"
                      sx={{ flex: 1 }}
                      placeholder="e.g., totalLessons, streak"
                    />
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={condition.operator}
                        onChange={(e) =>
                          handleConditionFieldChange(
                            index,
                            "operator",
                            e.target.value
                          )
                        }
                        label="Operator"
                      >
                        <MenuItem value="=">=</MenuItem>
                        <MenuItem value=">=">&gt;=</MenuItem>
                        <MenuItem value="<=">&lt;=</MenuItem>
                        <MenuItem value="<">&lt;</MenuItem>
                        <MenuItem value=">">&gt;</MenuItem>
                        <MenuItem value="in">in</MenuItem>
                        <MenuItem value="contains">contains</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Value"
                      value={condition.value}
                      onChange={(e) =>
                        handleConditionFieldChange(
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      size="small"
                      sx={{ flex: 1 }}
                      placeholder='e.g., 10 or ["reading","vocab"]'
                    />
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleRemoveCondition(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
                No conditions added. Click "Add Condition" to create one.
              </Box>
            )}
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
