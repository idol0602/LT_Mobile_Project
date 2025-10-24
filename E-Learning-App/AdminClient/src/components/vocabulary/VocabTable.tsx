// src/components/VocabTable.tsx
import React from "react";
import {
  Paper,
  Typography,
  Box,
  TablePagination, // Import component phân trang
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { VocabCard } from "./VocabCard"; // Import component card

const API_BASE_URL = "http://localhost:3000";
// Định nghĩa lại interface cho VocabTable
interface Vocabulary {
  _id: string;
  word: string;
  definition: string;
  partOfSpeech: string;
  pronunciation?: string;
  exampleSentence?: string;
  imageFileId?: string;
}

interface VocabListProps {
  vocabularies: Vocabulary[];
  onEdit: (vocab: Vocabulary) => void;
  onDelete: (id: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VocabTable({
  vocabularies,
  onEdit,
  onDelete,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: VocabListProps) {
  // Xử lý trường hợp không có dữ liệu
  if (vocabularies.length === 0) {
    return (
      <Paper
        sx={{
          p: 5,
          textAlign: "center",
          border: "2px dashed",
          borderColor: "divider",
          boxShadow: 0,
          bgcolor: "transparent",
        }}
      >
        <InfoIcon sx={{ mb: 1, color: "text.disabled" }} />
        <Typography>No vocabulary words match your filters.</Typography>
      </Paper>
    );
  }
  const handlePlayAudio = (word: string) => {
    // URL này trỏ đến API cache audio mà bạn đã xây dựng trên server
    const audioUrl = `${API_BASE_URL}/api/audio/play?word=${encodeURIComponent(
      word
    )}`;
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => console.error("Lỗi khi phát audio:", err));
  };
  // Render một Paper chứa cả danh sách Card và thanh phân trang
  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
      {/* VÙNG CHỨA DANH SÁCH CARD (SỬ DỤNG FLEXBOX) */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {vocabularies
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((vocab, index) => (
            // Không cần Grid item nữa, VocabCard là con trực tiếp
            <VocabCard
              key={vocab._id}
              vocab={vocab}
              onEdit={onEdit}
              onDelete={onDelete}
              index={index}
              onPlayAudio={handlePlayAudio}
            />
          ))}
      </Box>

      {/* THÀNH PHẦN PHÂN TRANG (GIỮ NGUYÊN) */}
      <TablePagination
        component="div"
        count={vocabularies.length}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ borderTop: "1px solid", borderColor: "divider" }}
      />
    </Paper>
  );
}
