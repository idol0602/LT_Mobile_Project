import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getVocabularies,
  getVocabulariesByIds,
} from "../../../services/vocabularyApi";

interface Vocabulary {
  _id: string;
  word: string;
  definition: string;
  partOfSpeech: string;
  language?: string;
}

interface Step2_VocabProps {
  selectedVocabIds: string[];
  onVocabChange: (ids: string[]) => void;
}

export function Step2_Vocab({
  selectedVocabIds,
  onVocabChange,
}: Step2_VocabProps) {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [searchLang, setSearchLang] = useState("");
  const [error, setError] = useState("");

  // 🔹 Lấy vocab từ DB (khi mount hoặc khi tìm kiếm)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getVocabularies(
          0,
          50,
          searchTerm,
          searchLang,
          posFilter
        );
        const data = res.data?.data || res.data || [];
        setVocabList(data);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải từ vựng:", err);
        setError("Không thể tải dữ liệu từ vựng từ server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, posFilter, searchLang]);

  // 🔸 Thêm từ vựng
  const handleAddVocab = (id: string) => {
    if (!selectedVocabIds.includes(id)) {
      onVocabChange([...selectedVocabIds, id]);
    }
  };

  // 🔸 Xóa từ vựng
  const handleRemoveVocab = (id: string) => {
    onVocabChange(selectedVocabIds.filter((vId) => vId !== id));
  };

  const handleClearSearch = () => setSearchTerm("");

  // 🔸 Lấy dữ liệu từ vocabList hoặc fallback
  const findVocab = (id: string): Vocabulary | undefined =>
    vocabList.find((v) => v._id === id);

  return (
    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 1 }}>
      {/* LEFT: Danh sách vocab */}
      <Box sx={{ flex: 1, minWidth: 400 }}>
        <Typography fontWeight="bold" color="#088395" mb={1}>
          🔍 Từ vựng có sẵn trong hệ thống
        </Typography>

        <TextField
          placeholder="Tìm kiếm từ vựng..."
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <IconButton onClick={handleClearSearch}>
                <ClearIcon />
              </IconButton>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box
            sx={{
              mt: 1,
              maxHeight: 320,
              overflowY: "auto",
              border: "1px solid #E5E7EB",
              borderRadius: 2,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Từ</TableCell>
                  <TableCell>Định nghĩa</TableCell>
                  <TableCell align="center">Thêm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vocabList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Không có từ nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  vocabList.map((vocab) => (
                    <TableRow key={vocab._id}>
                      <TableCell>{vocab.word}</TableCell>
                      <TableCell>{vocab.definition}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAddVocab(vocab._id)}
                          disabled={selectedVocabIds.includes(vocab._id)}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>

      {/* RIGHT: Từ vựng đã chọn */}
      <Box sx={{ flex: 1, minWidth: 400 }}>
        <Typography fontWeight="bold" color="#088395" mb={1}>
          📘 Từ vựng đã chọn ({selectedVocabIds.length})
        </Typography>

        {selectedVocabIds.length === 0 ? (
          <Alert severity="info">Chưa chọn từ nào.</Alert>
        ) : (
          <Box
            sx={{
              maxHeight: 340,
              overflowY: "auto",
              border: "1px solid #E5E7EB",
              borderRadius: 2,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Từ</TableCell>
                  <TableCell>Định nghĩa</TableCell>
                  <TableCell align="center">Xóa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedVocabIds.map((id) => {
                  const vocab = findVocab(id);
                  return (
                    <TableRow key={id}>
                      <TableCell>{vocab?.word || "—"}</TableCell>
                      <TableCell>
                        {vocab?.definition || "Không có dữ liệu"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveVocab(id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
}
