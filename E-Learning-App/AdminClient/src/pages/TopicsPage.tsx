import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Fade,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";

interface Topic {
  _id?: string;
  title: string;
  description: string;
  level: string;
  createdAt?: string;
}

const API_BASE_URL = "http://localhost:3000";

export default function TopicPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Dữ liệu giả (mock)
  useEffect(() => {
    setTopics([
      {
        _id: "1",
        title: "Daily Conversations",
        description:
          "Các mẫu câu giao tiếp hằng ngày, dễ học và áp dụng nhanh.",
        level: "Beginner",
      },
      {
        _id: "2",
        title: "Business English",
        description: "Tiếng Anh trong công việc, email, họp và thuyết trình.",
        level: "Intermediate",
      },
      {
        _id: "3",
        title: "Travel English",
        description: "Từ vựng và hội thoại dùng khi đi du lịch quốc tế.",
        level: "Elementary",
      },
    ]);
  }, []);

  const handleOpenForm = (topic?: Topic) => {
    setSelectedTopic(topic || { title: "", description: "", level: "" });
    setOpenForm(true);
  };

  const handleCloseForm = () => setOpenForm(false);

  const handleSave = () => {
    if (selectedTopic?._id) {
      setTopics((prev) =>
        prev.map((t) => (t._id === selectedTopic._id ? selectedTopic : t))
      );
    } else {
      setTopics((prev) => [
        ...prev,
        { ...selectedTopic!, _id: Date.now().toString() },
      ]);
    }
    setOpenForm(false);
  };

  const handleDelete = (id: string) => {
    setTopics((prev) => prev.filter((t) => t._id !== id));
  };

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3, color: "#088395" }}
      >
        🧭 Quản lý chủ đề học tiếng Anh
      </Typography>

      {/* Thanh công cụ */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 3,
          border: "1px solid #E0E7EF",
          background:
            "linear-gradient(135deg, rgba(8,131,149,0.05), rgba(0,184,169,0.08))",
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Tìm kiếm chủ đề..."
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#64748B" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "#088395",
            "&:hover": { bgcolor: "#0a9ca2" },
            whiteSpace: "nowrap",
          }}
          onClick={() => handleOpenForm()}
        >
          Thêm chủ đề
        </Button>
      </Paper>

      {/* Danh sách chủ đề */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 3,
        }}
      >
        {filteredTopics.map((topic, i) => (
          <Fade in key={topic._id} timeout={200 + i * 80}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#0a0a0a", mb: 1 }}
                >
                  {topic.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#475569",
                    mb: 2,
                    minHeight: "48px",
                  }}
                >
                  {topic.description}
                </Typography>
                <ChipLevel level={topic.level} />
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", pr: 2 }}>
                <Tooltip title="Chỉnh sửa">
                  <IconButton
                    onClick={() => handleOpenForm(topic)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton
                    onClick={() => handleDelete(topic._id!)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Fade>
        ))}
      </Box>

      {/* Dialog Form */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTopic?._id ? "Chỉnh sửa chủ đề" : "Thêm chủ đề mới"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Tiêu đề *"
            value={selectedTopic?.title || ""}
            onChange={(e) =>
              setSelectedTopic({
                ...selectedTopic,
                title: e.target.value,
              } as Topic)
            }
            fullWidth
          />
          <TextField
            label="Miêu tả"
            multiline
            rows={3}
            value={selectedTopic?.description || ""}
            onChange={(e) =>
              setSelectedTopic({
                ...selectedTopic,
                description: e.target.value,
              } as Topic)
            }
            fullWidth
          />
          <TextField
            label="Cấp độ *"
            select
            value={selectedTopic?.level || ""}
            onChange={(e) =>
              setSelectedTopic({
                ...selectedTopic,
                level: e.target.value,
              } as Topic)
            }
            fullWidth
          >
            {["Beginner", "Elementary", "Intermediate", "Advanced"].map(
              (lvl) => (
                <MenuItem key={lvl} value={lvl}>
                  {lvl}
                </MenuItem>
              )
            )}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseForm}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedTopic?._id ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ---------- Chip hiển thị cấp độ ---------- */
function ChipLevel({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    Beginner: "#16a34a",
    Elementary: "#3b82f6",
    Intermediate: "#f59e0b",
    Advanced: "#dc2626",
  };
  return (
    <Box
      sx={{
        display: "inline-block",
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "white",
        bgcolor: colorMap[level] || "#64748B",
      }}
    >
      {level}
    </Box>
  );
}
