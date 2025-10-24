import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const API_BASE_URL = "http://localhost:5050";

interface Vocabulary {
  _id: string;
  word: string;
  definition: string;
  partOfSpeech: string;
  pronunciation?: string;
  exampleSentence?: string;
  imageFileId?: string;
}

interface VocabCardProps {
  vocab: Vocabulary;
  onEdit: (vocab: Vocabulary) => void;
  onDelete: (id: string) => void;
  onPlayAudio: (word: string) => void;
  index: number;
}

const partOfSpeechColors: Record<
  string,
  "primary" | "success" | "warning" | "secondary" | "info"
> = {
  noun: "primary",
  verb: "success",
  adjective: "warning",
  adverb: "secondary",
  default: "info",
};

export const VocabCard = ({
  vocab,
  onEdit,
  onDelete,
  onPlayAudio,
  index,
}: VocabCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleEdit = () => {
    onEdit(vocab);
    handleClose();
  };
  const handleDelete = () => {
    onDelete(vocab._id);
    handleClose();
  };

  const color =
    partOfSpeechColors[vocab.partOfSpeech] || partOfSpeechColors.default;

  return (
    <Fade in timeout={300 + index * 50}>
      <Card
        sx={{
          position: "relative",
          borderRadius: 3,
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          backgroundColor: "#fff",
          border: "1px solid #E4E6EB",
          transition: "all 0.25s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
          },
        }}
      >
        {/* Menu góc phải trên */}
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 3, // đảm bảo menu trên hình
            color: "#64748B",
            "&:hover": { color: "#088395" },
          }}
        >
          <MoreVertIcon />
        </IconButton>

        <CardContent
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2.5,
            p: 2.5,
            pt: 3, // đẩy nội dung xuống để tránh trùng menu
          }}
        >
          {/* Ảnh + nút play */}
          <Box
            sx={{
              position: "relative",
              width: 100,
              height: 100,
              borderRadius: 2,
              overflow: "hidden",
              flexShrink: 0,
              "&:hover .play-button": {
                opacity: 1,
                transform: "translate(-50%, -50%) scale(1.05)",
              },
              "&:hover .image-overlay": {
                opacity: 1,
              },
            }}
          >
            <Box
              component="img"
              src={
                vocab.imageFileId
                  ? `${API_BASE_URL}/api/images/${vocab.imageFileId}`
                  : "https://placehold.co/100?text=No+Img"
              }
              alt={vocab.word}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              className="image-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.4)",
                opacity: 0,
                transition: "opacity 0.3s ease",
              }}
            />
            <IconButton
              className="play-button"
              onClick={() => onPlayAudio(vocab.word)}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
                color: "white",
                backgroundColor: "rgba(8,131,149,0.7)",
                opacity: 0,
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "rgba(8,131,149,0.9)" },
              }}
            >
              <VolumeUpIcon />
            </IconButton>
          </Box>

          {/* Nội dung */}
          <Box sx={{ flexGrow: 1, pr: 4 }}>
            {" "}
            {/* thêm padding phải để tránh trùng menu */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1E293B", lineHeight: 1.3 }}
                >
                  {vocab.word}
                </Typography>
                {vocab.pronunciation && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#9AA6B2", fontStyle: "italic", mt: 0.3 }}
                  >
                    {vocab.pronunciation}
                  </Typography>
                )}
              </Box>

              <Chip
                label={vocab.partOfSpeech}
                size="small"
                color={color}
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  zIndex: 2,
                }}
              />
            </Box>
            <Typography
              variant="body1"
              sx={{ color: "#334155", mb: 0.8, lineHeight: 1.5 }}
            >
              {vocab.definition}
            </Typography>
            {vocab.exampleSentence && (
              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  fontStyle: "italic",
                  borderLeft: "3px solid #E2E8F0",
                  pl: 1,
                }}
              >
                “{vocab.exampleSentence}”
              </Typography>
            )}
          </Box>
        </CardContent>

        {/* Menu thao tác */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          elevation={3}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              zIndex: 5,
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: "#088395" }} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: "#e11d48" }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "#e11d48" }}>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </Fade>
  );
};
