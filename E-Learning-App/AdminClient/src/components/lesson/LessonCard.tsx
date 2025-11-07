import type React from "react";
import { Edit2, Trash2, BookOpen, Volume2, PenTool, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import { palette } from "../../styles/palette";

interface LessonCardProps {
  lesson: {
    _id?: string;
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "";
    topic: string;
    type: "vocab" | "listen" | "grammar" | "reading" | "";
  };
  index: number;
  onEdit: (lesson: any) => void;
  onDelete: (id: string) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onEdit,
  onDelete,
}) => {
  const getLevelStyle = (level: string) => {
    switch (level) {
      case "Beginner":
        return { color: palette.success, label: "🌱 Beginner" };
      case "Intermediate":
        return { color: palette.info, label: "⚡ Intermediate" };
      case "Advanced":
        return { color: palette.warning, label: "🚀 Advanced" };
      default:
        return { color: palette.textSecondary, label: "N/A" };
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "vocab":
        return { icon: <BookOpen size={22} />, label: "Vocabulary" };
      case "listen":
        return { icon: <Volume2 size={22} />, label: "Listening" };
      case "grammar":
        return { icon: <PenTool size={22} />, label: "Grammar" };
      case "reading":
        return { icon: <Eye size={22} />, label: "Reading" };
      default:
        return { icon: <BookOpen size={22} />, label: "Unknown" };
    }
  };

  const levelInfo = getLevelStyle(lesson.level);
  const typeInfo = getTypeInfo(lesson.type);

  return (
    <Card
      sx={{
        width: 350,
        height: 230,
        borderRadius: 4,
        background: palette.background,
        boxShadow: palette.shadowMd,
        border: `1px solid ${palette.border}`,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: palette.shadowLg,
          borderColor: palette.primaryLight,
        },
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: palette.gradientPrimary,
          opacity: 0.06,
        },
      }}
    >
      {/* Header Stripe */}
      <Box
        sx={{
          height: "6px",
          background: palette.gradientOcean,
        }}
      />

      <CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: `${palette.primaryLight}22`,
                color: palette.primary,
                p: 1.2,
                borderRadius: 2,
              }}
            >
              {typeInfo.icon}
            </Box>
            <Typography
              variant="h6"
              fontWeight={700}
              color={palette.textPrimary}
              sx={{ lineHeight: 1.2 }}
            >
              {lesson.name}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => onEdit(lesson)}
              sx={{
                color: palette.info,
                "&:hover": { bgcolor: palette.infoLight },
              }}
            >
              <Edit2 size={18} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => lesson._id && onDelete(lesson._id)}
              sx={{
                color: palette.danger,
                "&:hover": { bgcolor: palette.dangerLight },
              }}
            >
              <Trash2 size={18} />
            </IconButton>
          </Box>
        </Box>

        {/* Topic */}
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            ml: 5,
            fontSize: "0.95rem",
            color: palette.textSecondary,
          }}
        >
          <b style={{ color: palette.textPrimary }}>Topic:</b> {lesson.topic}
        </Typography>

        {/* Chips */}
        <Box sx={{ display: "flex", gap: 1, ml: 5 }}>
          <Chip
            label={levelInfo.label}
            sx={{
              bgcolor: `${levelInfo.color}20`,
              color: levelInfo.color,
              fontWeight: 600,
              fontSize: "0.8rem",
              px: 1.5,
              borderRadius: "999px",
            }}
          />
          <Chip
            label={typeInfo.label}
            sx={{
              bgcolor: `${palette.secondaryLight}25`,
              color: palette.secondaryDark,
              fontWeight: 600,
              fontSize: "0.8rem",
              px: 1.5,
              borderRadius: "999px",
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
