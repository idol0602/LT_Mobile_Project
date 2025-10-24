// src/components/VocabFilter.tsx
import React from "react";
import {
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Fade,
  Box, // Sử dụng Box thay vì Grid
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearAllIcon from "@mui/icons-material/ClearAll";

interface VocabFilterProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  posFilter: string;
  onPosFilterChange: (event: SelectChangeEvent<string>) => void;
  // --- Thêm props mới ---
  searchLang: string;
  onSearchLangChange: (event: SelectChangeEvent<string>) => void;
  onReset: () => void;
}

export function VocabFilter({
  searchTerm,
  onSearchChange,
  posFilter,
  onPosFilterChange,
  searchLang,
  onSearchLangChange,
  onReset,
}: VocabFilterProps) {
  // Cập nhật điều kiện reset
  const isFilterActive =
    searchTerm.trim() !== "" || posFilter !== "all" || searchLang !== "both";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper", // Sử dụng màu nền từ theme
      }}
    >
      {/* Sử dụng Box với Flexbox */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Xếp dọc trên mobile, ngang trên desktop
          gap: 2,
          alignItems: "center", // Canh giữa các item theo chiều dọc
        }}
      >
        {/* Ô tìm kiếm */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm từ vựng (Anh/Việt)..."
          value={searchTerm}
          onChange={onSearchChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }, // Bo góc cho ô input
          }}
          sx={{ flexGrow: 1 }} // Cho phép ô tìm kiếm co giãn
        />

        {/* Dropdown chọn ngôn ngữ */}
        <FormControl sx={{ minWidth: { xs: "100%", md: 150 } }}>
          {" "}
          {/* Đặt chiều rộng tối thiểu */}
          <InputLabel>Ngôn ngữ</InputLabel>
          <Select
            value={searchLang}
            label="Ngôn ngữ"
            onChange={onSearchLangChange}
            sx={{ borderRadius: 2 }} // Bo góc
          >
            <MenuItem value="both">Tất cả</MenuItem>
            <MenuItem value="en">Tiếng Anh</MenuItem>
            <MenuItem value="vi">Tiếng Việt</MenuItem>
          </Select>
        </FormControl>

        {/* Lọc theo loại từ */}
        <FormControl sx={{ minWidth: { xs: "100%", md: 180 } }}>
          <InputLabel>Loại từ</InputLabel>
          <Select
            value={posFilter}
            label="Loại từ"
            onChange={onPosFilterChange}
            sx={{ borderRadius: 2 }} // Bo góc
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="noun">Noun</MenuItem>
            <MenuItem value="verb">Verb</MenuItem>
            <MenuItem value="adjective">Adjective</MenuItem>
            <MenuItem value="adverb">Adverb</MenuItem>
          </Select>
        </FormControl>

        {/* Nút Reset */}
        <Fade in={isFilterActive} timeout={300}>
          {/* Đặt nút trong Box để giữ vị trí ngay cả khi Fade out */}
          <Box sx={{ minWidth: { xs: "100%", md: "auto" } }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearAllIcon />}
              onClick={onReset}
              sx={{ height: 56 }} // Căn chiều cao bằng các ô input/select
            >
              Reset
            </Button>
          </Box>
        </Fade>
      </Box>
    </Paper>
  );
}
